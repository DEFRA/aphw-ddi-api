const Joi = require('joi')

const userBooleanResponseSchema = Joi.object({
  result: Joi.boolean()
})

const userStringResponseSchema = Joi.object({
  result: Joi.string()
})

module.exports = {
  userBooleanResponseSchema,
  userStringResponseSchema
}
