const Joi = require('joi')

const dogsQueryParamsSchema = Joi.object({
  forPurging: Joi.string().optional().allow('').allow(null),
  sortKey: Joi.string().optional().allow('').allow(null),
  sortOrder: Joi.string().optional().allow('').allow(null)
})

module.exports = {
  dogsQueryParamsSchema
}
