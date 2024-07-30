const Joi = require('joi')

const notFoundSchema = Joi.object({
  statusCode: Joi.number().allow(404),
  error: Joi.string().allow('Not Found'),
  message: Joi.string()
})

module.exports = {
  notFoundSchema
}
