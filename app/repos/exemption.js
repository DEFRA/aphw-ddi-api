const { isFuture } = require('date-fns')
const sequelize = require('../config/db')
const { getCdo } = require('./cdo')
const { getCourt, getPoliceForce } = require('../lookups')
const { createOrUpdateInsurance } = require('./insurance')
const { sendUpdateToAudit } = require('../messaging/send-audit')
const { EXEMPTION } = require('../constants/event/audit-event-object-types')
const constants = require('../constants/statuses')
const { updateStatus } = require('../repos/dogs')
const { preChangedExemptionAudit, postChangedExemptionAudit } = require('../dto/auditing/exemption')

const updateExemption = async (data, user, transaction) => {
  if (!transaction) {
    return sequelize.transaction((t) => updateExemption(data, user, t))
  }

  try {
    const cdo = await lookupCdo(data)

    const policeForce = await lookupPoliceForce(data)

    await autoChangeStatus(cdo, data, transaction)

    const registration = cdo.registration

    const preChanged = preChangedExemptionAudit(cdo)

    updateRegistration(registration, data, policeForce)

    handleOrder2023(registration, data)

    await handleOrder2015(registration, data, cdo)

    await createOrUpdateInsurance(data, cdo, transaction)

    const res = registration.save({ transaction })

    const postChanged = postChangedExemptionAudit(data)

    await sendUpdateToAudit(EXEMPTION, preChanged, postChanged, user)

    return res
  } catch (err) {
    console.error(`Error updating CDO: ${err}`)
    throw err
  }
}

const autoChangeStatus = async (cdo, data, transaction) => {
  const currentStatus = cdo?.status?.status

  if (currentStatus === constants.statuses.PreExempt) {
    if (!cdo.registration.removed_from_cdo_process && data.removedFromCdoProcess) {
      await updateStatus(cdo.index_number, constants.statuses.Failed, transaction)
    } else if (data.insurance?.renewalDate && isFuture(data.insurance?.renewalDate) && !cdo.registration.certificate_issued && data.certificateIssued) {
      await updateStatus(cdo.index_number, constants.statuses.Exempt, transaction)
    }
  } else if (currentStatus === constants.statuses.InterimExempt) {
    if (!cdo.registration.cdo_issued && data.cdoIssued) {
      await updateStatus(cdo.index_number, constants.statuses.PreExempt, transaction)
    }
  }

  if (cdo.registration.exemption_order?.exemption_order === '2023') {
    if (!cdo.registration.withdrawn && data.withdrawn) {
      await updateStatus(cdo.index_number, constants.statuses.Withdrawn, transaction)
    }
  }
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
  registration.removed_from_cdo_process = data.removedFromCdoProcess ?? null
}

const handleOrder2023 = (registration, data) => {
  if (registration.exemption_order.exemption_order === '2023') {
    registration.microchip_deadline = data.microchipDeadline ?? null
    registration.typed_by_dlo = data.typedByDlo ?? null
    registration.withdrawn = data.withdrawn ?? null
  }
}

const handleOrder2015 = async (registration, data, cdo) => {
  if (registration.exemption_order.exemption_order === '2015' && cdo?.status?.status !== constants.statuses.InterimExempt) {
    const court = await getCourt(data.court)

    if (!court) {
      throw new Error(`Court not found: ${data.court}`)
    }

    registration.court_id = court.id
  }
}

module.exports = {
  updateExemption,
  autoChangeStatus
}
