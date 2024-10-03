const Joi = require('joi')

const userBooleanResponseSchema = Joi.object({
  result: Joi.boolean()
})

const userStringResponseSchema = Joi.object({
  result: Joi.string()
})

const createUserRequestSchema = Joi.object({
  username: Joi.string().email().required(),
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

const bulkRequestSchema = Joi.object({
  users: Joi.array().items(createUserRequestSchema).min(1).required()
})

const bulkResponseSchema = Joi.object({
  users: Joi.array().items(createUserResponseSchema).required(),
  errors: Joi.array().items(Joi.object({
    username: Joi.string().required(),
    code: Joi.number().required(),
    message: Joi.string()
  }))
})

module.exports = {
  userBooleanResponseSchema,
  userStringResponseSchema,
  createUserRequestSchema,
  createUserResponseSchema,
  bulkRequestSchema,
  bulkResponseSchema
}
