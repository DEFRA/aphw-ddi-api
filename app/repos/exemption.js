const { isFuture } = require('date-fns')
const sequelize = require('../config/db')
const { getCdo } = require('./cdo')
const { getCourt, getPoliceForce } = require('../lookups')
const { createOrUpdateInsurance } = require('./insurance')
const { sendUpdateToAudit } = require('../messaging/send-audit')
const { EXEMPTION } = require('../constants/event/audit-event-object-types')
const constants = require('../constants/statuses')
const { updateStatus } = require('./dogs')
const { preChangedExemptionAudit, postChangedExemptionAudit } = require('../dto/auditing/exemption')
const { deepClone } = require('../lib/deep-clone')
const { dateTodayOrInFuture } = require('../lib/date-helpers')
const { updateSearchIndexPolice } = require('./search-index')

const updateExemption = async (data, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => updateExemption(data, user, t))
  }

  try {
    const cdo = await lookupCdo(data)

    const policeForce = await lookupPoliceForce(data)
    const origPoliceForceId = cdo?.registration?.police_force_id

    const preChanged = preChangedExemptionAudit(cdo)

    const changedStatus = await autoChangeStatus(cdo, data, transaction)

    const registration = cdo.registration
    const previousRegistration = deepClone(registration)

    cdo.insurance_spotcheck_date = data.insurance_spotcheck_date
    cdo.save({ transaction })
    updateRegistration(registration, data, policeForce)

    handleOrderSpecificFields(registration, data)

    await handleCourt(registration, data, cdo)

    await createOrUpdateInsurance(data, cdo, transaction)

    setDefaults(registration, data, previousRegistration)

    const res = registration.save({ transaction })

    data.status = changedStatus
    const postChanged = postChangedExemptionAudit(data)

    await updateSearchIndexPolice(cdo.id, origPoliceForceId, policeForce?.id, transaction)

    await sendUpdateToAudit(EXEMPTION, preChanged, postChanged, user)

    return res
  } catch (err) {
    console.error('Error updating CDO:', err)
    throw err
  }
}

const canSetExemptDueToInsuranceRenewal = (data, cdo) => {
  return dateTodayOrInFuture(data.insurance?.renewalDate) &&
    cdo.dog_breaches?.length === 1 &&
    cdo.dog_breaches[0].breach_category?.short_name === 'INSURANCE_EXPIRED'
}

const autoChangeStatus = async (cdo, data, transaction) => {
  const currentStatus = cdo?.status?.status

  if (currentStatus === constants.statuses.PreExempt) {
    if (!cdo.registration.non_compliance_letter_sent && data.nonComplianceLetterSent) {
      return await updateStatus(cdo.index_number, constants.statuses.Failed, transaction)
    } else if (data.insurance?.renewalDate && isFuture(data.insurance?.renewalDate) && data.certificateIssued) {
      return await updateStatus(cdo.index_number, constants.statuses.Exempt, transaction)
    }
  } else if (currentStatus === constants.statuses.InterimExempt) {
    if (!cdo.registration.cdo_issued && data.cdoIssued) {
      return await updateStatus(cdo.index_number, constants.statuses.PreExempt, transaction)
    }
  } else if (currentStatus === constants.statuses.InBreach && canSetExemptDueToInsuranceRenewal(data, cdo)) {
    return await updateStatus(cdo.index_number, constants.statuses.Exempt, transaction)
  }

  if (cdo.registration.exemption_order?.exemption_order === '2023' &&
      !cdo.registration.withdrawn &&
      data.withdrawn) {
    return await updateStatus(cdo.index_number, constants.statuses.Withdrawn, transaction)
  }

  return currentStatus
}

const lookupCdo = async (data) => {
  const cdo = await getCdo(data.indexNumber)

  if (!cdo) {
    throw new Error(`CDO not found: ${data.indexNumber}`)
  }

  return cdo
}

const lookupPoliceForce = async (data) => {
  if (data.policeForce) {
    const policeForce = await getPoliceForce(data.policeForce)

    if (!policeForce) {
      throw new Error(`Police force not found: ${data.policeForce}`)
    }

    return policeForce
  }
}

const updateRegistration = (registration, data, policeForce) => {
  registration.cdo_issued = data.cdoIssued
  registration.cdo_expiry = data.cdoExpiry
  registration.police_force_id = policeForce.id
  registration.legislation_officer = data.legislationOfficer
  registration.certificate_issued = data.certificateIssued ?? null
  registration.application_fee_paid = data.applicationFeePaid ?? null
  registration.neutering_confirmation = data.neuteringConfirmation ?? null
  registration.microchip_verification = data.microchipVerification ?? null
  registration.joined_exemption_scheme = data.joinedExemptionScheme ?? null
  registration.non_compliance_letter_sent = data.nonComplianceLetterSent ?? null

  if (data.applicationFeePaid && !registration.application_fee_payment_recorded) {
    registration.application_fee_payment_recorded = new Date()
  } else if (!data.applicationFeePaid) {
    registration.application_fee_payment_recorded = null
  }

  if (data.neuteringConfirmation && data.microchipVerification && !registration.verification_dates_recorded) {
    registration.verification_dates_recorded = new Date()
  } else if (!data.neuteringConfirmation || !data.microchipVerification) {
    registration.verification_dates_recorded = null
  }
}

const handleOrderSpecificFields = (registration, data) => {
  if (registration.exemption_order.exemption_order === '2023') {
    registration.neutering_deadline = data.neuteringDeadline ?? null
    registration.microchip_deadline = data.microchipDeadline ?? null
    registration.typed_by_dlo = data.typedByDlo ?? null
    registration.withdrawn = data.withdrawn ?? null
  } else if (registration.exemption_order.exemption_order === '2015') {
    registration.neutering_deadline = data.neuteringDeadline ?? null
    registration.microchip_deadline = data.microchipDeadline ?? null
  }
}

/**
 * @param registration
 * @param data
 * @param previousRegistration
 */
const setDefaults = (registration, data, previousRegistration) => {
  if (
    (data.cdoExpiry === null || data.cdoExpiry === undefined) &&
    (data.cdoIssued !== null && data.cdoIssued !== undefined) &&
    (previousRegistration.cdo_issued === null || previousRegistration.cdo_issued === undefined)
  ) {
    const cdoExpiryDate = new Date(data.cdoIssued)
    cdoExpiryDate.setMonth(cdoExpiryDate.getMonth() + 2)
    registration.cdo_expiry = cdoExpiryDate.toISOString()
  }
}

const handleCourt = async (registration, data, cdo) => {
  if (data.court && data.court !== '') {
    const court = await getCourt(data.court)

    if (!court) {
      throw new Error(`Court not found: ${data.court}`)
    }

    registration.court_id = court.id
  }
}

module.exports = {
  updateExemption,
  setDefaults,
  autoChangeStatus,
  canSetExemptDueToInsuranceRenewal,
  updateRegistration
}
