const Joi = require('joi')

const deleteResponseSchema = Joi.object({
  count: Joi.object({
    failed: Joi.number().required(),
    success: Joi.number().required()
  }).required(),
  deleted: Joi.object({
    failed: Joi.array().items(Joi.string()).min(0).required(),
    success: Joi.array().items(Joi.string()).min(0).required()
  }).required()
}).required()

module.exports = {
  deleteResponseSchema
}
