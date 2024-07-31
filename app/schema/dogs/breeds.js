const Joi = require('joi')

const dogBreedSchema = Joi.object({
  id: Joi.number(),
  breed: Joi.string(),
  display_order: Joi.number()
})

const dogBreedResponseSchema = Joi.object({
  breeds: Joi.array().items(dogBreedSchema)
})

module.exports = {
  dogBreedResponseSchema
}
