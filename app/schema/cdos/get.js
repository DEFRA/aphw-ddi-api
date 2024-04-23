const Joi = require('joi')

const getCdosQuerySchema = Joi.object({
  withinDays: Joi.number(),
  status: Joi.array().items(Joi.string()).single()
}).or('withinDays', 'status')

const getCdosResponseSchema = Joi.object({
  cdos: Joi.array().items(Joi.object({
    person: Joi.object({
      id: Joi.number().required(),
      firstName: Joi.string().allow(null).allow('').required(),
      lastName: Joi.string().allow(null).allow('').required(),
      personReference: Joi.string().required()
    }).unknown().required(),
    dog: Joi.object({
      id: Joi.number().required(),
      dogReference: Joi.string().required(),
      status: Joi.string().required()
    }).unknown().required(),
    exemption: Joi.object({
      policeForce: Joi.string().required(),
      cdoExpiry: Joi.string().allow(null).required()
    }).unknown().required()
  })).required()
}).unknown()

module.exports = {
  getCdosQuerySchema,
  getCdosResponseSchema
}