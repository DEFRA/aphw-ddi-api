const Joi = require('joi')

const dogsQueryParamsSchema = Joi.object({
  forPurging: Joi.boolean().optional(),
  sortKey: Joi.string().optional(),
  sortOrder: Joi.string().optional().allow('ASC', 'DESC'),
  stepNum: Joi.number().optional().allow(1, 2)

})

module.exports = {
  dogsQueryParamsSchema
}
