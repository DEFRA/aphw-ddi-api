const { isFuture } = require('date-fns')
const sequelize = require('../config/db')
const { deepClone } = require('../lib/deep-clone')
const { getCdo } = require('./cdo')
const { getCourt, getPoliceForce } = require('../lookups')
const { createInsurance, updateInsurance } = require('./insurance')
const { sendUpdateToAudit } = require('../messaging/send-audit')
const { EXEMPTION } = require('../constants/event/audit-event-object-types')
const constants = require('../constants/statuses')
const { updateStatus } = require('../repos/dogs')

const updateExemption = async (data, user, transaction) => {
  if (!transaction) {
    return sequelize.transaction((t) => updateExemption(data, user, t))
  }

  try {
    const cdo = await getCdo(data.indexNumber)

    if (!cdo) {
      throw new Error(`CDO not found: ${data.indexNumber}`)
    }

    let policeForce

    if (data.policeForce) {
      policeForce = await getPoliceForce(data.policeForce)

      if (!policeForce) {
        throw new Error(`Police force not found: ${data.policeForce}`)
      }
    }

    await autoChangeStatus(cdo, data, transaction)

    const registration = cdo.registration

    const preChangedRegistration = deepClone(registration)
    preChangedRegistration.index_number = data.indexNumber

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

    if (registration.exemption_order.exemption_order === '2023') {
      registration.microchip_deadline = data.microchipDeadline ?? null
      registration.typed_by_dlo = data.typedByDlo ?? null
      registration.withdrawn = data.withdrawn ?? null
    }

    if (registration.exemption_order.exemption_order === '2015') {
      const court = await getCourt(data.court)

      if (data.court && data.court !== '' && !court) {
        throw new Error(`Court not found: ${data.court}`)
      }

      registration.court_id = court?.id ?? null
    }

    const insurance = cdo.insurance.sort((a, b) => b.id - a.id)[0]

    if (data.insurance) {
      if (!insurance) {
        await createInsurance(cdo.id, {
          company: data.insurance.company,
          renewalDate: data.insurance.renewalDate
        }, transaction)
      } else {
        await updateInsurance(insurance, {
          company: data.insurance.company,
          renewalDate: data.insurance.renewalDate
        }, transaction)
      }
    }

    const res = registration.save({ transaction })

    await sendUpdateToAudit(EXEMPTION, preChangedRegistration, registration, user)

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
  }

  if (cdo.registration.exemption_order?.exemption_order === '2023') {
    if (!cdo.registration.withdrawn && data.withdrawn) {
      await updateStatus(cdo.index_number, constants.statuses.Withdrawn, transaction)
    }
  }
}

module.exports = {
  updateExemption,
  autoChangeStatus
}
