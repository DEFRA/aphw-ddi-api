const Joi = require('joi')

const schema = Joi.object({
  exemptionOrder: Joi.number().allow(2023, 2015).required(),
  owner: Joi.object({
    name: Joi.string().required(),
    address: Joi.object({
      line1: Joi.string().required(),
      line2: Joi.string().optional().allow(null).allow('').default(''),
      line3: Joi.string().optional().allow(null).allow('').default(''),
      postcode: Joi.string().required()
    }).required()
  }).required(),
  dog: Joi.object({
    indexNumber: Joi.string().required(),
    microchipNumber: Joi.string().required(),
    name: Joi.string().required(),
    breed: Joi.string().required(),
    sex: Joi.string().allow('Male', 'Female').required(),
    birthDate: Joi.date().iso().required(),
    colour: Joi.string().required(),
    certificateIssued: Joi.date().iso().optional().default(new Date())
  }).required()
}).required()

module.exports = schema
