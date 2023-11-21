const Joi = require('joi')

const dogSchema = Joi.object({
  dog_reference: Joi.string().required(),
  index_number: Joi.number().required(),
  dog_breed_id: Joi.number().required(),
  status_id: Joi.number().required(),
  name: Joi.string().required(),
  birth_date: Joi.date().required(),
  tattoo: Joi.string().required(),
  microchip_number: Joi.string().required(),
  microchip_type_id: Joi.number().required(),
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
