const Joi = require('joi')
const insuranceQuerySchema = Joi.object({
  sort: Joi.string().valid('updatedAt', 'name'),
  order: Joi.string().valid('ASC', 'DESC')
})

module.exports = {
  insuranceQuerySchema
}
