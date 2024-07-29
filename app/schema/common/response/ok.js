const Joi = require('joi')

const successResponseSchema = Joi.object({
  result: Joi.string().allow('ok')
})

module.exports = {
  successResponseSchema
}
