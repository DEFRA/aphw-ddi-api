const mapExemptionDaoToDto = (exemption) => ({
  id: exemption.id,
  dog_id: exemption.dog_id,
  status_id: exemption.status_id,
  police_force_id: exemption.police_force_id,
  court_id: exemption.court_id,
  exemption_order_id: exemption.exemption_order_id,
  cdo_issued: exemption.cdo_issued,
  cdo_expiry: exemption.cdo_expiry,
  time_limit: exemption.time_limit,
  certificate_issued: exemption.certificate_issued,
  legislation_officer: exemption.legislation_officer,
  application_fee_paid: exemption.application_fee_paid,
  neutering_confirmation: exemption.neutering_confirmation,
  microchip_verification: exemption.microchip_verification,
  joined_exemption_scheme: exemption.joined_exemption_scheme,
  withdrawn: exemption.withdrawn,
  typed_by_dlo: exemption.typed_by_dlo,
  microchip_deadline: exemption.microchip_deadline,
  neutering_deadline: exemption.neutering_deadline,
  non_compliance_letter_sent: exemption.non_compliance_letter_sent,
  application_pack_sent: exemption.application_pack_sent,
  form_two_sent: exemption.form_two_sent,
  police_force: {
    id: exemption.police_force.id,
    name: exemption.police_force.name
  },
  court: {
    id: exemption.court.id,
    name: exemption.court.name
  },
  exemption_order: {
    id: exemption.exemption_order.id,
    exemption_order: exemption.exemption_order.exemption_order,
    active: exemption.exemption_order.active
  }
})

module.exports = {
  mapExemptionDaoToDto
}
