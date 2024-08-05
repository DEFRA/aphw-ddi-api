const Joi = require('joi')

const exportCreateFileQuerySchema = Joi.object({
  batchSize: Joi.number().optional()
})

module.exports = {
  exportCreateFileQuerySchema
}
