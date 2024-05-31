const Joi = require('joi')

const dogsQueryParamsSchema = Joi.object({
  forPurging: Joi.boolean().optional(),
  sortKey: Joi.string().optional(),
  sortOrder: Joi.string().optional().allow('ASC', 'DESC'),
  statuses: Joi.string().optional(),
  today: Joi.date().optional()
})

module.exports = {
  dogsQueryParamsSchema
}
