const Joi = require('joi')

const dogsQueryParamsSchema = Joi.object({
  forPurging: Joi.boolean().optional(),
  sortKey: Joi.string().optional(),
  sortOrder: Joi.string().optional().allow('ASC', 'DESC'),
  statuses: Joi.string().optional().allow('Exempt', 'Failed', 'Inactive', 'Interim exempt', 'In breach', 'Pre-exempt', 'Withdrawn'),
  today: Joi.date().optional()
})

module.exports = {
  dogsQueryParamsSchema
}
