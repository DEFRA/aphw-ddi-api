const Joi = require('joi')

const purgeSoftDeleteQuerySchema = Joi.object({
  today: Joi.date().optional().default(new Date())
})

const purgeSoftDeleteResponseSchema = Joi.object({
  count: Joi.object({
    dogs: Joi.number().required(),
    owners: Joi.number().required(),
    total: Joi.number().required()
  }).required(),
  deleted: Joi.object({
    dogs: Joi.array().items(Joi.string()).min(0),
    owners: Joi.array().items(Joi.string()).min(0)
  }).required()
}).unknown(true)

module.exports = {
  purgeSoftDeleteQuerySchema,
  purgeSoftDeleteResponseSchema
}
