const Joi = require('joi')

const createUserRequestSchema = Joi.object({
  username: Joi.string().required(),
  active: Joi.boolean().default(true),
  telephone: Joi.string()
})

const createUserResponseSchema = createUserRequestSchema

module.exports = {
  createUserRequestSchema,
  createUserResponseSchema
}
