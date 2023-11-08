const Joi = require('joi')

const dogSchema = Joi.object({
  id: Joi.string().required(),
  orig_id: Joi.number().required(),
  dog_breed_id: Joi.number().required(),
  status_id: Joi.number().required(),
  name: Joi.string().required(),
  birth_date: Joi.date().required(),
  tattoo: Joi.string().required(),
  microchip_number: Joi.string().required(),
  microchip_type_id: Joi.number().required(),
  colour: Joi.string().required(),
  sex: Joi.string().required(),
  exported: Joi.boolean().required()
})

// Validate schema
const isValidImportedDog = (dog) => {
  return dogSchema.validate(dog)
}

module.exports = {
  isValidImportedDog
}
