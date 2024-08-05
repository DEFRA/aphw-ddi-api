const Joi = require('joi')

const createActivitySchema = Joi.object({
  label: Joi.string().required(),
  activityType: Joi.string().required(),
  activitySource: Joi.string().required()
}).required()

const createActivityResponseSchema = Joi.object({
  id: Joi.number(),
  label: Joi.string(),
  activityType: Joi.string(),
  activitySource: Joi.string()
})

module.exports = {
  createActivitySchema,
  createActivityResponseSchema
}
