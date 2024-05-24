const Joi = require('Joi')

const deletePayloadSchema = Joi.object({
  personReferences: Joi.array().items(Joi.string()).min(1).required()
}).required()

const deleteResponseSchema = Joi.object({
  count: Joi.object({
    failed: Joi.number().required(),
    success: Joi.number().required()
  }),
  deleted: Joi.object({
    failed: Joi.array().items(Joi.string().required()).min(0),
    success: Joi.array().items(Joi.string().required()).min(0)
  })
})

module.exports = {
  deletePayloadSchema, deleteResponseSchema
}
