const Joi = require('joi')

const recordInsuranceDetailsSchema = Joi.object({
  insuranceCompany: Joi.string().allow('').required(),
  insuranceRenewal: Joi.date().required().when('insuranceCompany', { is: '', then: Joi.valid(null).required(), otherwise: Joi.date().required() })
}).required()

const recordInsuranceDetailsResponseSchema = Joi.object({
  insuranceCompany: Joi.string().allow('').required(),
  insuranceRenewal: Joi.date().allow(null).required()
}).required()

const recordMicrochipNumberSchema = Joi.object({
  microchipNumber: Joi.string().min(15).required()
}).required()

const recordMicrochipNumberResponseSchema = Joi.object({
  microchipNumber: Joi.string().required()
}).required()

const recordApplicationFeeSchema = Joi.object({
  applicationFeePaid: Joi.date().required()
}).required()

const verifyDatesSchema = Joi.object({
  microchipVerification: Joi.date().required(),
  neuteringConfirmation: Joi.date().required()
}).required()

const taskSchemaBuilder = (key) => Joi.object({
  key: Joi.string().allow(key),
  available: Joi.boolean().required(),
  completed: Joi.boolean().required(),
  readonly: Joi.boolean().required(),
  timestamp: Joi.date().optional().allow(null)
}).unknown()

const manageCdoResponseSchema = Joi.object({
  tasks: Joi.object({
    applicationPackSent: taskSchemaBuilder('applicationPackSent'),
    insuranceDetailsRecorded: taskSchemaBuilder('insuranceDetailsRecorded'),
    microchipNumberRecorded: taskSchemaBuilder('microchipNumberRecorded'),
    applicationFeePaid: taskSchemaBuilder('applicationFeePaid'),
    form2Sent: taskSchemaBuilder('form2Sent'),
    verificationDateRecorded: taskSchemaBuilder('verificationDateRecorded'),
    certificateIssued: taskSchemaBuilder('certificateIssued')
  }).unknown(),
  applicationPackSent: Joi.date().optional(),
  insuranceCompany: Joi.string().optional(),
  insuranceRenewal: Joi.date().optional(),
  microchipNumber: Joi.string().optional(),
  applicationFeePaid: Joi.date().optional(),
  form2Sent: Joi.date().optional()
}).unknown()

const simpleConflictSchema = Joi.object({
  message: Joi.string()
})

const recordMicrochipNumberConflictSchema = Joi.object({
  statusCode: Joi.number().allow(409),
  error: Joi.string().allow('Conflict'),
  message: Joi.string(),
  microchipNumbers: Joi.array().items(Joi.string())
})

const issueCertificateResponseSchema = Joi.object({
  certificateIssued: Joi.date()
})

module.exports = {
  recordInsuranceDetailsSchema,
  recordInsuranceDetailsResponseSchema,
  recordMicrochipNumberSchema,
  recordMicrochipNumberResponseSchema,
  recordApplicationFeeSchema,
  verifyDatesSchema,
  manageCdoResponseSchema,
  simpleConflictSchema,
  recordMicrochipNumberConflictSchema,
  issueCertificateResponseSchema
}
