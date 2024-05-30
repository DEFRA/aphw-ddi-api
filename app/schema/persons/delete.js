const Joi = require('joi')

const deletePayloadSchema = Joi.object({
  personReferences: Joi.array().items(Joi.string()).min(1).required()
}).required()

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
  deletePayloadSchema, deleteResponseSchema
}