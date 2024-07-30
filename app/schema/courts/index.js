const Joi = require('joi')

const courtDtoSchema = Joi.object({
  id: Joi.number(),
  name: Joi.string()
})

const courtsResponseSchema = Joi.object({
  courts: Joi.array().items(courtDtoSchema)
})

const createCourtResponseSchema = Joi.object({
  id: Joi.number(),
  name: Joi.string()
})

const deleteCourtResponseSchema = Joi.object({})

module.exports = {
  courtsResponseSchema,
  createCourtResponseSchema
}
