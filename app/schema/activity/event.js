const Joi = require('joi')

const schema = Joi.object({
  activity: Joi.string().required(),
  activityType: Joi.string().required(),
  pk: Joi.string().required(),
  source: Joi.string().required(),
  activityDate: Joi.date().iso().required(),
  'activityDate-day': Joi.any().allow('').allow(null).optional(),
  'activityDate-month': Joi.any().allow('').allow(null).optional(),
  'activityDate-year': Joi.any().allow('').allow(null).optional(),
  srcHashParam: Joi.string().allow('').allow(null).optional()
}).required()

module.exports = schema
