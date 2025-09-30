const Joi = require('joi')
const { getCdo } = require('../../repos/cdo')

const exemption = Joi.object({
  indexNumber: Joi.string().required(),
  exemptionOrder: Joi.number().required(),
  cdoIssued: Joi.date().optional().allow(null).iso(),
  cdoExpiry: Joi.date().optional().allow(null).iso(),
  court: Joi.string().optional().allow('').allow(null),
  policeForce: Joi.string().required(),
  legislationOfficer: Joi.string().allow(null).allow('').optional(),
  certificateIssued: Joi.date().iso().allow(null).optional(),
  applicationFeePaid: Joi.date().iso().allow(null).optional(),
  neuteringConfirmation: Joi.date().iso().allow(null).optional(),
  microchipVerification: Joi.date().iso().allow(null).optional(),
  joinedExemptionScheme: Joi.date().iso().allow(null).optional(),
  nonComplianceLetterSent: Joi.date().iso().allow(null).optional(),
  insurance: Joi.object({
    company: Joi.string().optional(),
    renewalDate: Joi.date().iso().required()
  }).optional(),
  insurance_spotcheck_date: Joi.date().iso().optional()

})

const payloadSchema2015Xlb = exemption.append({
  neuteringDeadline: Joi.date().iso().optional(),
  microchipDeadline: Joi.date().iso().optional()
})

const payloadSchema2015NonXlb = exemption.append({
  microchipDeadline: Joi.date().iso().optional()
})

const payloadSchema2023 = exemption.append({
  neuteringDeadline: Joi.date().iso().optional(),
  microchipDeadline: Joi.date().iso().optional(),
  typedByDlo: Joi.date().iso().optional(),
  withdrawn: Joi.date().iso().optional()
})

const fullExemptionPayloadSchema = exemption.append({
  neuteringDeadline: Joi.date().iso().optional(),
  microchipDeadline: Joi.date().iso().optional(),
  typedByDlo: Joi.date().iso().optional(),
  withdrawn: Joi.date().iso().optional()})

const validatePayload = async (payload) => {
  let schema = exemption

  const cdo = await getCdo(payload.indexNumber)

  const order = cdo?.registration.exemption_order.exemption_order

  if (order === '2023') {
    schema = payloadSchema2023
  } else if (order === '2015') {
    if (cdo?.dog_breed?.breed === 'XL Bully') {
      schema = payloadSchema2015Xlb
    } else {
      schema = payloadSchema2015NonXlb
    }
  }

  const { value, error } = schema.validate(payload)

  if (error) {
    throw error
  }

  return value
}

const exemptionResponseSchema = Joi.object({
  id: Joi.number(),
  dog_id: Joi.number(),
  status_id: Joi.number(),
  police_force_id: Joi.number().allow(null),
  court_id: Joi.number().allow(null),
  exemption_order_id: Joi.number(),
  cdo_issued: Joi.date().allow(null),
  cdo_expiry: Joi.date().allow(null),
  time_limit: Joi.date().allow(null),
  certificate_issued: Joi.date().allow(null),
  legislation_officer: Joi.string().allow(null).allow(''),
  application_fee_paid: Joi.date().allow(null),
  neutering_confirmation: Joi.date().allow(null),
  microchip_verification: Joi.date().allow(null),
  joined_exemption_scheme: Joi.date().allow(null),
  withdrawn: Joi.date().allow(null),
  typed_by_dlo: Joi.date().allow(null),
  microchip_deadline: Joi.date().allow(null),
  neutering_deadline: Joi.date().allow(null),
  non_compliance_letter_sent: Joi.date().allow(null),
  application_pack_sent: Joi.date().allow(null),
  form_two_sent: Joi.date().allow(null),
  police_force: Joi.object({
    id: Joi.number().allow(null),
    name: Joi.string().allow(null).allow('')
  }),
  court: Joi.object({
    id: Joi.number().allow(null),
    name: Joi.string().allow(null).allow('')
  }),
  exemption_order: Joi.object({
    id: Joi.number(),
    exemption_order: Joi.string().allow(null).allow(''),
    active: Joi.boolean()
  })
})

module.exports = {
  validatePayload,
  fullExemptionPayloadSchema,
  exemptionResponseSchema
}
