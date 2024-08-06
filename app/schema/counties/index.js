const Joi = require('joi')

const countiesResponseSchema = Joi.object({
  counties: Joi.array().items(Joi.string())
})

module.exports = {
  countiesResponseSchema
}
