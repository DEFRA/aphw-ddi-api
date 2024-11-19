const { deepClone } = require('../../lib/deep-clone')
const { extractLatestInsurance, stripTime } = require('../dto-helper')

const preChangedExemptionAudit = (cdo) => {
  const reg = deepClone(cdo.registration)

  const latestInsurance = extractLatestInsurance(cdo?.insurance)

  const pre = {
    index_number: cdo.index_number ?? null,
    certificate_issued: reg.certificate_issued ?? null,
    police_force: reg.police_force?.name ?? null,
    legislation_officer: reg.legislation_officer ?? null,
    application_fee_paid: reg.application_fee_paid ?? null,
    insurance_company: latestInsurance?.company?.company_name ?? null,
    insurance_renewal_date: stripTime(latestInsurance?.renewal_date) ?? null,
    neutering_confirmation: reg.neutering_confirmation ?? null,
    microchip_verification: reg.microchip_verification ?? null,
    joined_exemption_scheme: reg.joined_exemption_scheme ?? null,
    non_compliance_letter_sent: reg.non_compliance_letter_sent ?? null,
    microchip_deadline: reg.microchip_deadline ?? null,
    neutering_deadline: reg.neutering_deadline ?? null,
    typed_by_dlo: reg.typed_by_dlo ?? null,
    withdrawn: reg.withdrawn ?? null,
    exemption_order: reg.exemption_order?.exemption_order ?? null,
    court: reg.court?.name ?? null,
    cdo_issued: reg.cdo_issued ?? null,
    cdo_expiry: reg.cdo_expiry ?? null,
    status: cdo.status?.status ?? null
  }

  return pre
}

const postChangedExemptionAudit = (data) => {
  const post = {
    index_number: data.indexNumber ?? null,
    certificate_issued: stripTime(data.certificateIssued) ?? null,
    police_force: data.policeForce ?? null,
    legislation_officer: data.legislationOfficer ?? null,
    application_fee_paid: stripTime(data.applicationFeePaid) ?? null,
    insurance_company: data?.insurance?.company ?? null,
    insurance_renewal_date: stripTime(data?.insurance?.renewalDate) ?? null,
    neutering_confirmation: stripTime(data.neuteringConfirmation) ?? null,
    microchip_verification: stripTime(data.microchipVerification) ?? null,
    joined_exemption_scheme: stripTime(data.joinedExemptionScheme) ?? null,
    non_compliance_letter_sent: stripTime(data.nonComplianceLetterSent) ?? null,
    microchip_deadline: stripTime(data.microchipDeadline) ?? null,
    neutering_deadline: stripTime(data.neuteringDeadline) ?? null,
    typed_by_dlo: stripTime(data.typedByDlo) ?? null,
    withdrawn: stripTime(data.withdrawn) ?? null,
    exemption_order: data.exemptionOrder ? `${data.exemptionOrder}` : null,
    court: data.court ?? null,
    cdo_issued: stripTime(data.cdoIssued) ?? null,
    cdo_expiry: stripTime(data.cdoExpiry) ?? null,
    status: data.status ?? null
  }

  return post
}

module.exports = {
  preChangedExemptionAudit,
  postChangedExemptionAudit
}
