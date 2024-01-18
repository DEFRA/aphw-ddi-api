const sequelize = require('../config/db')
const { deepClone } = require('../lib/deep-clone')
const { getCdo } = require('./cdo')
const { getCourt, getPoliceForce } = require('../lookups')
const { createInsurance, updateInsurance } = require('./insurance')
const { sendUpdateToAudit } = require('../messaging/send-audit')

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

    const registration = cdo.registration

    const preChangedRegistration = deepClone(registration)

    registration.cdo_issued = data.cdoIssued
    registration.cdo_expiry = data.cdoExpiry
    registration.police_force_id = policeForce.id
    registration.legislation_officer = data.legislationOfficer
    registration.certificate_issued = data.certificateIssued
    registration.application_fee_paid = data.applicationFeePaid
    registration.neutering_confirmation = data.neuteringConfirmation
    registration.microchip_verification = data.microchipVerification
    registration.joined_exemption_scheme = data.joinedExemptionScheme

    if (registration.exemption_order.exemption_order === '2023') {
      registration.microchip_deadline = data.microchipDeadline
      registration.typed_by_dlo = data.typedByDlo
      registration.withdrawn = data.withdrawn
    }

    if (registration.exemption_order.exemption_order === '2015') {
      const court = await getCourt(data.court)

      if (!court) {
        throw new Error(`Court not found: ${data.court}`)
      }

      registration.court_id = court.id
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

    await sendUpdateToAudit('exemption', preChangedRegistration, registration, user)

    return res
  } catch (err) {
    console.error(`Error updating CDO: ${err}`)
    throw err
  }
}

module.exports = {
  updateExemption
}
