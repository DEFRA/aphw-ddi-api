const Joi = require('joi')

const userBooleanResponseSchema = Joi.object({
  result: Joi.boolean()
})

const userStringResponseSchema = Joi.object({
  result: Joi.string()
})

const createUserRequestSchema = Joi.object({
  username: Joi.string().email().lowercase().required(),
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

const reportSomethingSchema = Joi.object({
  fields: Joi.array().items({
    name: Joi.string().required(),
    value: Joi.string().allow('').optional()
  }).optional(),
  reportData: Joi.object().optional()
})

const bulkRequestSchema = Joi.object({
  users: Joi.array().items(createUserRequestSchema).min(1).required()
})

const bulkResponseSchema = Joi.object({
  users: Joi.array().items(createUserResponseSchema).required(),
  errors: Joi.array().items(Joi.object({
    username: Joi.string().required(),
    error: Joi.string(),
    statusCode: Joi.number().required(),
    message: Joi.string()
  }))
})

const getResponseSchema = Joi.object({
  users: Joi.array().items(createUserResponseSchema).required()
})

module.exports = {
  userBooleanResponseSchema,
  userStringResponseSchema,
  createUserRequestSchema,
  createUserResponseSchema,
  userFeedbackSchema,
  reportSomethingSchema,
  bulkRequestSchema,
  bulkResponseSchema,
  getResponseSchema
}
