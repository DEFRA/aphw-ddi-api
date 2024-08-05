const Joi = require('joi')

const putDogPayloadSchema = Joi.object({
  dogId: Joi.number(),
  indexNumber: Joi.string().required(),
  breed: Joi.string(),
  name: Joi.string().allow(null).allow(''),
  applicationType: Joi.string(),
  cdoIssued: Joi.date().allow(null),
  cdoExpiry: Joi.date().allow(null),
  interimExemption: Joi.date().allow(null),
  status: Joi.string(),
  microchipNumber: Joi.string().allow(null).allow(''),
  microchipNumber2: Joi.string().allow(null).allow(''),
  colour: Joi.string().allow('').allow(null),
  sex: Joi.string().allow('').allow(null),
  dateOfBirth: Joi.date().allow(null),
  dateOfDeath: Joi.date().allow(null),
  tattoo: Joi.string().allow('').allow(null),
  dateExported: Joi.date().allow(null),
  dateStolen: Joi.date().allow(null),
  dateUntraceable: Joi.date().allow(null)
}).unknown()

module.exports = {
  putDogPayloadSchema
}
