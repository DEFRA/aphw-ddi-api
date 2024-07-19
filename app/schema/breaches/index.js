const Joi = require('joi')
const setBreachRequestSchema = Joi.object({
  indexNumber: Joi.string().required(),
  dogBreaches: Joi.array().items(Joi.string()).min(1).required()
}).required()

const setBreachResponseSchema = Joi.object({
  id: Joi.number().required(),
  indexNumber: Joi.string().required(),
  name: Joi.string().allow(null).allow('').required(),
  breed: Joi.string().required().required(),
  colour: Joi.string().allow(null).allow('').required(),
  sex: Joi.string().allow(null).allow('').required(),
  dateOfBirth: Joi.date().allow(null).required(),
  dateOfDeath: Joi.date().allow(null).required(),
  tattoo: Joi.string().allow(null).allow('').required(),
  microchipNumber: Joi.string().allow(null).allow('').required(),
  microchipNumber2: Joi.string().allow(null).allow('').required(),
  dateExported: Joi.date().allow(null).required(),
  dateStolen: Joi.date().allow(null).required(),
  dateUntraceable: Joi.date().allow(null).required(),
  breaches: Joi.array().items(Joi.string()).min(1).required()
}).unknown()

module.exports = {
  setBreachRequestSchema,
  setBreachResponseSchema
}
