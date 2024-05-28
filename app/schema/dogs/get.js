const Joi = require('joi')

const dogsQueryParamsSchema = Joi.object({
  forPurging: Joi.string().optional().allow('').allow(null)
})

module.exports = {
  dogsQueryParamsSchema
}
