const Joi = require('joi')

const conflictSchema = Joi.object({
  statusCode: Joi.number().allow(409).required(),
  error: Joi.string().allow('Conflict').required(),
  message: Joi.string().required()
})

module.exports = {
  conflictSchema
}
