const Joi = require('joi')

const jobsQuerySchema = Joi.object({
  today: Joi.date().optional().default(new Date())
})

const purgeSoftDeletedCount = Joi.object({
  dogs: Joi.number().required(),
  owners: Joi.number().required(),
  total: Joi.number().required()
}).required()

const purgeSoftDeletedIndexes = Joi.object({
  dogs: Joi.array().items(Joi.string()).min(0),
  owners: Joi.array().items(Joi.string()).min(0)
}).required()

const purgeSoftDeleteResponseSchema = Joi.object({
  count: Joi.object({
    success: purgeSoftDeletedCount,
    failed: purgeSoftDeletedCount
  }).required(),
  deleted: Joi.object({
    success: purgeSoftDeletedIndexes,
    failed: purgeSoftDeletedIndexes
  }).required()
}).unknown(true)

const expiredInsuranceResponseSchema = Joi.object({
  response: Joi.string()
}).unknown(true)

const defaultJobsResponse = Joi.object({
  response: Joi.string()
})

module.exports = {
  jobsQuerySchema,
  purgeSoftDeleteResponseSchema,
  expiredInsuranceResponseSchema,
  defaultJobsResponse
}
