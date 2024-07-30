const Joi = require('joi')

const notFoundSchema = Joi.object({
  statusCode: 404,
  error: 'Not Found',
  message: 'Not Found'
})

module.exports = {
  notFoundSchema
}
