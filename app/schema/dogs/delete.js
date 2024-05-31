const Joi = require('joi')

const deleteDogsPayloadSchema = Joi.object({
  dogPks: Joi.array().items(Joi.string()).min(1).required()
}).required()

const deleteDogsResponseSchema = Joi.object({
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
  deleteDogsPayloadSchema, deleteDogsResponseSchema
}
