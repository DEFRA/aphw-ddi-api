const Joi = require('joi')

const schema = Joi.object({
  activity: Joi.string().required(),
  activityType: Joi.string().required(),
  pk: Joi.string().required(),
  source: Joi.string().required(),
  targetPk: Joi.string().optional(),
  activityDate: Joi.date().iso().required()
}).required()

module.exports = schema
