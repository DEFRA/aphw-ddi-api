const Joi = require('joi')
const insuranceQuerySchema = Joi.object({
  sortKey: Joi.string().valid('updatedAt', 'name').default('name'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('ASC')
})

module.exports = {
  insuranceQuerySchema
}
