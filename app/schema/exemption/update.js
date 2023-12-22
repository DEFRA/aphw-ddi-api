const Joi = require('joi')

const exemption = Joi.object({
  indexNumber: Joi.string().required(),
  cdoIssued: Joi.date().iso().required(),
  cdoExpiry: Joi.date().iso().required(),
  court: Joi.string().required(),
  policeForce: Joi.string().required(),
  legislationOfficer: Joi.string().optional(),
  certificateIssued: Joi.date().iso().optional(),
  applicationFeePaid: Joi.date().iso().optional(),
  neuteringConfirmation: Joi.date().iso().optional(),
  microchipVerification: Joi.date().iso().optional(),
  joinedExemptionScheme: Joi.date().iso().optional(),
  insurance: Joi.object({
    company: Joi.string().required(),
    renewalDate: Joi.date().iso().required()
  }).optional()
})

module.exports = {
  exemption
}
