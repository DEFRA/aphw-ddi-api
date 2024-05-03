const Joi = require('joi')

const createActivitySchema = Joi.object({
  label: Joi.string().required(),
  activityType: Joi.string().required(),
  activitySource: Joi.string().required()
}).required()

module.exports = {
  createActivitySchema
}
