const Joi = require('joi')

const exemption = Joi.object({
  indexNumber: Joi.string().required(),
  cdoIssued: Joi.date().iso().required(),
  cdoExpiry: Joi.date().iso().required(),
  court: Joi.string().required(),
  policeForce: Joi.string().required(),
  legislationOfficer: Joi.string().allow(null).allow('').optional(),
  certificateIssued: Joi.date().iso().allow(null).optional(),
  applicationFeePaid: Joi.date().iso().allow(null).optional(),
  neuteringConfirmation: Joi.date().iso().allow(null).optional(),
  microchipVerification: Joi.date().iso().allow(null).optional(),
  joinedExemptionScheme: Joi.date().iso().allow(null).optional(),
  insurance: Joi.object({
    company: Joi.string().optional(),
    renewalDate: Joi.date().iso().required()
  }).optional()
})

module.exports = {
  exemption
}
