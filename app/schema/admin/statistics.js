const Joi = require('joi')
const statisticsQuerySchema = Joi.object({
  queryName: Joi.string().valid('countsPerStatus', 'countsPerCountry').required()
})

module.exports = {
  statisticsQuerySchema
}
