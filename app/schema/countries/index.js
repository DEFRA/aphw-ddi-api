const Joi = require('joi')

const countriesResponseSchema = Joi.object({
  countries: Joi.array().items(Joi.string())
})

module.exports = {
  countriesResponseSchema
}
