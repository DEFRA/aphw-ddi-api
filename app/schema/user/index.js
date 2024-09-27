const Joi = require('joi')

const createUserRequestSchema = Joi.object({
  username: Joi.string().required(),
  active: Joi.boolean().default(true),
  police_force: Joi.string().allow('').allow(null),
  police_force_id: Joi.number()
})

const createUserResponseSchema = Joi.object({
  username: Joi.string().required(),
  active: Joi.boolean().default(true),
  police_force_id: Joi.number()
})

module.exports = {
  createUserRequestSchema,
  createUserResponseSchema
}
