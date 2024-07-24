const Joi = require('joi')

const recordInsuranceDetailsSchema = Joi.object({
  insuranceCompany: Joi.string().allow('').required(),
  insuranceRenewal: Joi.date().required().when('insuranceCompany', { is: '', then: Joi.valid(null).required(), otherwise: Joi.date().required() })
}).required()

const recordInsuranceDetailsResponseSchema = Joi.object({
  insuranceCompany: Joi.string().allow('').required(),
  insuranceRenewal: Joi.date().allow(null).required()
}).required()

const recordMicrochipNumberSchema = Joi.object({
  microchipNumber: Joi.string().min(15).required()
}).required()

const recordMicrochipNumberResponseSchema = Joi.object({
  microchipNumber: Joi.string().required()
}).required()

const recordApplicationFeeSchema = Joi.object({
  applicationFeePaid: Joi.date().required()
}).required()

const verifyDatesSchema = Joi.object({
  microchipVerification: Joi.date().required(),
  neuteringConfirmation: Joi.date().required()
}).required()

module.exports = {
  recordInsuranceDetailsSchema,
  recordInsuranceDetailsResponseSchema,
  recordMicrochipNumberSchema,
  recordMicrochipNumberResponseSchema,
  recordApplicationFeeSchema,
  verifyDatesSchema
}
