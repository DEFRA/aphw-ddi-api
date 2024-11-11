const Joi = require('joi')
const { sortOrder } = require('../../constants/sorting')

const userBooleanResponseSchema = Joi.object({
  result: Joi.boolean()
})

const userValidResponseSchema = Joi.object({
  result: Joi.object({
    valid: Joi.boolean(),
    accepted: Joi.boolean()
  })
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

const fullUserResponseSchema = Joi.object({
  id: Joi.number().required(),
  username: Joi.string().required(),
  active: Joi.boolean().default(true),
  policeForceId: Joi.number().optional(),
  policeForce: Joi.string().optional(),
  accepted: Joi.date().iso().allow(false),
  activated: Joi.date().iso().allow(false),
  lastLogin: Joi.date().iso().allow(false),
  createdAt: Joi.date().iso().allow(false)
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
  users: Joi.array().items(fullUserResponseSchema).required(),
  errors: Joi.array().items(Joi.object({
    username: Joi.string().required(),
    error: Joi.string(),
    statusCode: Joi.number().required(),
    message: Joi.string()
  }))
})

const getUserResponseSchema = Joi.object({
  users: Joi.array().items(fullUserResponseSchema).required(),
  count: Joi.number().required()
})

const getUsersQuerySchema = Joi.object({
  username: Joi.string().optional(),
  policeForceId: Joi.number().optional(),
  policeForce: Joi.string().optional(),
  sortKey: Joi.string().allow('username', 'activated', 'policeForce').optional(),
  sortOrder: Joi.string().allow(sortOrder.ASC, sortOrder.DESC).optional(),
  activated: Joi.boolean().truthy('Y').falsy('N').optional()
})

module.exports = {
  userBooleanResponseSchema,
  userValidResponseSchema,
  userStringResponseSchema,
  createUserRequestSchema,
  userFeedbackSchema,
  reportSomethingSchema,
  bulkRequestSchema,
  bulkResponseSchema,
  getUserResponseSchema,
  getUsersQuerySchema
}
