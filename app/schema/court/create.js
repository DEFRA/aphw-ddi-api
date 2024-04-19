const Joi = require('joi')

const createCourtSchema = Joi.object({
  name: Joi.string().required()
}).required()

const responseSchema = Joi.object({
  courts: Joi.array().items(Joi.object({
    id: Joi.number().required(),
    name: Joi.string().required()
  })).required()
})

module.exports = {
  createCourtSchema,
  responseSchema
}
