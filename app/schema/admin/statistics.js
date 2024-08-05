const Joi = require('joi')
const statisticsQuerySchema = Joi.object({
  queryName: Joi.string().valid('countsPerStatus', 'countsPerCountry').required()
})

const statisticsItem = Joi.object({
  total: Joi.number(),
  status: Joi.object({
    name: Joi.string(),
    id: Joi.number().allow(null)
  }).optional()
})

const statisticsByCountryItem = Joi.object({
  total: Joi.number(),
  breed: Joi.string().optional(),
  country: Joi.string().optional()
})

const statisticsResponseSchema = Joi.array().items(statisticsItem.concat(statisticsByCountryItem))

module.exports = {
  statisticsQuerySchema,
  statisticsResponseSchema
}
