const Joi = require('joi')

const getCdosQuerySchema = Joi.object({
  withinDays: Joi.number(),
  status: Joi.array().items(Joi.string()).single(),
  sortKey: Joi.string().valid('cdoExpiry', 'joinedExemptionScheme', 'indexNumber', 'policeForce', 'owner'),
  nonComplianceLetterSent: Joi.boolean(),
  noCache: Joi.boolean().default(false),
  sortOrder: Joi.string().valid('ASC', 'DESC'),
  showTasks: Joi.boolean().truthy('Y').default(false)
}).or('withinDays', 'status')

const getCdosResponseSchema = Joi.object({
  counts: Joi.object({
    preExempt: Joi.object({
      total: Joi.number().required(),
      within30: Joi.number().required()
    }).required(),
    failed: Joi.object({
      nonComplianceLetterNotSent: Joi.number().required()
    }).required()
  }),
  count: Joi.number().required(),
  cdos: Joi.array().items(Joi.object({
    person: Joi.object({
      id: Joi.number().required(),
      firstName: Joi.string().allow(null).allow('').required(),
      lastName: Joi.string().allow(null).allow('').required(),
      personReference: Joi.string().required()
    }).unknown().required(),
    dog: Joi.object({
      id: Joi.number().required(),
      dogReference: Joi.string().required(),
      status: Joi.string().required()
    }).unknown().required(),
    exemption: Joi.object({
      policeForce: Joi.string().allow(null).required(),
      cdoExpiry: Joi.string().allow(null).required(),
      joinedExemptionScheme: Joi.string().allow(null).required(),
      nonComplianceLetterSent: Joi.string().allow(null).required()
    }).unknown().required(),
    taskList: Joi.array().optional()
  })).required()
}).unknown()

module.exports = {
  getCdosQuerySchema,
  getCdosResponseSchema
}
