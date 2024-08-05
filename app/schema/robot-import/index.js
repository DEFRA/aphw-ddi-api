const Joi = require('joi')

const robotImportResponseSchema = Joi.object({
  errors: Joi.array().items(Joi.string()),
  log: Joi.array().items(Joi.string()),
  rows: Joi.array().items(Joi.object().unknown())
})

module.exports = {
  robotImportResponseSchema
}
