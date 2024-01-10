const Joi = require('joi')

const dogSchema = Joi.object({
  dog_reference: Joi.string().required(),
  id: Joi.number().required(),
  dog_breed_id: Joi.number().required(),
  status_id: Joi.number().required(),
  name: Joi.string().required(),
  birth_date: Joi.date().optional(),
  tattoo: Joi.string().optional(),
  microchip_number: Joi.string().optional(),
  colour: Joi.string().required(),
  sex: Joi.string().required(),
  exported: Joi.boolean().required(),
  owner: Joi.number(),
  keeper: Joi.number()
})

// Validate schema
const isValidImportedDog = (dog) => {
  return dogSchema.validate(dog)
}

module.exports = {
  isValidImportedDog
}
