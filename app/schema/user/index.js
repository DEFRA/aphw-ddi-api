const Joi = require('joi')

const userBooleanResponseSchema = Joi.object({
  result: Joi.boolean()
})

const userStringResponseSchema = Joi.object({
  result: Joi.string()
})

const createUserRequestSchema = Joi.object({
  username: Joi.string().required(),
  active: Joi.boolean().default(true),
  police_force: Joi.string().allow('').allow(null),
  police_force_id: Joi.number()
})

const createUserResponseSchema = Joi.object({
  id: Joi.number().required(),
  username: Joi.string().required(),
  active: Joi.boolean().default(true),
  police_force_id: Joi.number()
})

const userFeedbackSchema = Joi.object({
  fields: Joi.array().items({
    name: Joi.string().required(),
    value: Joi.string().allow('').optional()
  }).optional()
})

module.exports = {
  userBooleanResponseSchema,
  userStringResponseSchema,
  createUserRequestSchema,
  createUserResponseSchema,
  userFeedbackSchema
}
