const Joi = require('joi')

const exemption = Joi.object({
  indexNumber: Joi.string().required(),
  cdoIssued: Joi.date().iso().required(),
  cdoExpiry: Joi.date().iso().required(),
  court: Joi.string().required(),
  policeForce: Joi.string().required(),
  legislationOfficer: Joi.string().allow(null).allow('').optional(),
  applicationFeePaidDate: Joi.date().iso().allow(null).allow('').optional(),
  neuteringConfirmationDate: Joi.date().iso().allow(null).allow('').optional(),
  exemptionSchemeJoinDate: Joi.date().iso().allow(null).allow('').optional(),
  insurance: Joi.object({
    company: Joi.string().required(),
    renewalDate: Joi.date().iso().required()
  }).optional()
})

module.exports = {
  exemption
}
