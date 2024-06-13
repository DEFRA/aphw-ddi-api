const Joi = require('joi')
const statisticsQuerySchema = Joi.object({
  queryName: Joi.string().valid('countsPerStatus').required()
})

module.exports = {
  statisticsQuerySchema
}
