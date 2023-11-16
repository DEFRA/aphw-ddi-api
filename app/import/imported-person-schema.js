const Joi = require('joi')

const personSchema = Joi.object({
  title: Joi.string().required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  address: Joi.object({
    address_line_1: Joi.string().required(),
    address_line_2: Joi.string(),
    address_line_3: Joi.string(),
    county: Joi.string(),
    postcode: Joi.string().required(),
    country: Joi.string().required()
  }),
  contacts: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    contact: Joi.string().required()
  }))
})

// Validate schema
const isValidImportedPerson = (person) => {
  return personSchema.validate(person)
}

module.exports = {
  isValidImportedPerson
}
