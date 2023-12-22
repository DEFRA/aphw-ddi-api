const sequelize = require('../config/db')
const { getCdo } = require('./cdo')
const { getCourt, getPoliceForce } = require('../lookups')
const { createInsurance, updateInsurance } = require('./insurance')

const updateExemption = async (data, transaction) => {
  if (!transaction) {
    return sequelize.transaction((t) => updateExemption(data, t))
  }

  try {
    const cdo = await getCdo(data.indexNumber)

    if (!cdo) {
      throw new Error(`CDO not found: ${data.indexNumber}`)
    }

    const court = await getCourt(data.court)

    if (!court) {
      throw new Error(`Court not found: ${data.court}`)
    }

    const policeForce = await getPoliceForce(data.policeForce)

    if (!policeForce) {
      throw new Error(`Police force not found: ${data.policeForce}`)
    }

    const registration = cdo.registration

    registration.cdo_issued = data.cdoIssued
    registration.cdo_expiry = data.cdoExpiry
    registration.court_id = court.id
    registration.police_force_id = policeForce.id
    registration.legislation_officer = data.legislationOfficer
    registration.certificate_issued = data.certificateIssued
    registration.application_fee_paid = data.applicationFeePaid
    registration.neutering_confirmation = data.neuteringConfirmation
    registration.microchip_verification = data.microchipVerification
    registration.exemption_scheme_join = data.exemptionSchemeJoin

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

    await registration.save({ transaction })
  } catch (err) {
    console.error(`Error updating CDO: ${err}`)
    throw err
  }
}

module.exports = {
  updateExemption
}
