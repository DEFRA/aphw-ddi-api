const Joi = require('joi')
const insuranceQuerySchema = Joi.object({
  sortKey: Joi.string().valid('updatedAt', 'name').default('name'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('ASC')
})

const createInsuranceCompanyPayloadSchema = Joi.object({
  name: Joi.string()
})

const insuranceCompanySchema = Joi.object({
  id: Joi.number(),
  name: Joi.string()
})

const getInsuranceCompaniesResponseSchema = Joi.object({
  companies: Joi.array().items(insuranceCompanySchema)
})

module.exports = {
  insuranceQuerySchema,
  createInsuranceCompanyPayloadSchema,
  insuranceCompanySchema,
  getInsuranceCompaniesResponseSchema
}
