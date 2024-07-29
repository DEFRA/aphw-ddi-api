const Joi = require('joi')

const activityItemSchema = Joi.object({
  id: Joi.number(),
  label: Joi.string(),
  activity_type_id: Joi.number(),
  activity_source_id: Joi.number(),
  display_order: Joi.number(),
  activity_event_id: Joi.number(),
  activity_type: Joi.object({
    id: Joi.number(),
    name: Joi.string()
  }),
  activity_source: Joi.object({
    id: Joi.number(),
    name: Joi.string()
  }),
  activity_event: Joi.object({
    id: Joi.number(),
    target_primary_key: Joi.string()
  })
}).unknown()

const getActivitySchema = Joi.object({
  activities: Joi.array().items(activityItemSchema)
})

module.exports = {
  getActivitySchema
}
