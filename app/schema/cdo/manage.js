const Joi = require('joi')
const { formatDate } = require('../../lib/date-helpers')

const emailApplicationPackPayloadSchema = Joi.object({
  email: Joi.string().required(),
  updateEmail: Joi.boolean().default(false)
}).required()

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
  neuteringConfirmation: Joi.alternatives().conditional('dogNotNeutered', { is: true, then: Joi.any().strip(), otherwise: Joi.date().required() }),
  microchipVerification: Joi.alternatives().conditional('dogNotFitForMicrochip', { is: true, then: Joi.any().strip(), otherwise: Joi.date().required() }),
  microchipDeadline: Joi.alternatives().conditional('dogNotFitForMicrochip', { is: true, then: Joi.date().required(), otherwise: Joi.disallow() }),
  dogNotNeutered: Joi.boolean().default(false),
  dogNotFitForMicrochip: Joi.boolean().default(false)
}).required()

const verifyDatesSchemaResponse = Joi.object({
  microchipVerification: Joi.alternatives().conditional('microchipDeadline', { is: Joi.date(), then: Joi.date().optional(), otherwise: Joi.date().required() }),
  neuteringConfirmation: Joi.alternatives().conditional('neuteringDeadline', { is: Joi.date(), then: Joi.date().optional(), otherwise: Joi.date().required() }),
  neuteringDeadline: Joi.date().optional(),
  microchipDeadline: Joi.date().optional()
}).required()

const taskSchemaBuilder = (key) => Joi.object({
  key: Joi.string().allow(key),
  available: Joi.boolean().required(),
  completed: Joi.boolean().required(),
  readonly: Joi.boolean().required(),
  timestamp: Joi.date().optional().allow(null)
}).unknown()

const manageCdoResponseSchema = Joi.object({
  indexNumber: Joi.string(),
  tasks: Joi.object({
    applicationPackSent: taskSchemaBuilder('applicationPackSent'),
    applicationPackProcessed: taskSchemaBuilder('applicationPackProcessed'),
    insuranceDetailsRecorded: taskSchemaBuilder('insuranceDetailsRecorded'),
    microchipNumberRecorded: taskSchemaBuilder('microchipNumberRecorded'),
    applicationFeePaid: taskSchemaBuilder('applicationFeePaid'),
    form2Sent: taskSchemaBuilder('form2Sent'),
    verificationDateRecorded: taskSchemaBuilder('verificationDateRecorded'),
    certificateIssued: taskSchemaBuilder('certificateIssued')
  }).unknown(),
  verificationOptions: Joi.object({
    dogDeclaredUnfit: Joi.boolean(),
    neuteringBypassedUnder16: Joi.boolean(),
    allowDogDeclaredUnfit: Joi.boolean(),
    allowNeuteringBypass: Joi.boolean(),
    showNeuteringBypass: Joi.boolean()
  }),
  applicationPackSent: Joi.date().optional(),
  applicationPackProcessed: Joi.date().optional(),
  insuranceCompany: Joi.string().optional(),
  insuranceRenewal: Joi.date().optional(),
  microchipNumber: Joi.string().optional(),
  microchipNumber2: Joi.string().optional(),
  applicationFeePaid: Joi.date().optional(),
  form2Sent: Joi.date().optional(),
  form2Submitted: Joi.date().optional(),
  cdoSummary: Joi.object({
    dog: Joi.object({
      name: Joi.string().allow('').allow(null).optional()
    }).optional(),
    person: Joi.object({
      firstName: Joi.string().allow('').allow(null).optional(),
      lastName: Joi.string().allow('').allow(null).optional(),
      email: Joi.string().allow(null).allow('').optional(),
      addressLine1: Joi.string().allow('').allow(null).optional(),
      addressLine2: Joi.string().allow('').allow(null).optional(),
      town: Joi.string().allow(null).optional(),
      postcode: Joi.string().allow(null).optional()
    }).optional(),
    exemption: Joi.object({
      cdoExpiry: Joi.date().optional(),
      neuteringDeadline: Joi.date().allow('').allow(null).optional()
    })
  }).optional()
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

const verifyDate = Joi.date().iso().custom((value, _) => {
  if (isNaN(value)) {
    return ''
  }
  return formatDate(value)
})

const submitFormTwoSchema = Joi.object({
  microchipNumber: Joi.alternatives().try(Joi.string().valid('').optional().default(''), Joi.string().min(15).required()),
  neuteringConfirmation: Joi.alternatives().conditional('dogNotNeutered', { is: true, then: Joi.any().custom(_ => ''), otherwise: verifyDate }),
  microchipVerification: Joi.alternatives().conditional('dogNotFitForMicrochip', { is: true, then: Joi.any().custom(_ => ''), otherwise: verifyDate }),
  microchipDeadline: Joi.alternatives().conditional('dogNotFitForMicrochip', { is: true, then: verifyDate, otherwise: Joi.valid('').default('') }),
  dogNotNeutered: Joi.boolean().default(false),
  dogNotFitForMicrochip: Joi.boolean().default(false)
})

const emailApplicationPackResponseSchema = Joi.object({
  email: Joi.string().required()
})

const postApplicationPackResponseSchema = Joi.object({
  firstName: Joi.string().allow('').required(),
  lastName: Joi.string().allow('').required(),
  addressLine1: Joi.string().allow('').allow(null).required(),
  addressLine2: Joi.string().allow('').allow(null).required(),
  town: Joi.string().allow('').allow(null).required(),
  postcode: Joi.string().allow('').allow(null).required()
}).required()

module.exports = {
  emailApplicationPackPayloadSchema,
  recordInsuranceDetailsSchema,
  recordInsuranceDetailsResponseSchema,
  recordMicrochipNumberSchema,
  recordMicrochipNumberResponseSchema,
  recordApplicationFeeSchema,
  verifyDatesSchema,
  verifyDatesSchemaResponse,
  manageCdoResponseSchema,
  simpleConflictSchema,
  recordMicrochipNumberConflictSchema,
  issueCertificateResponseSchema,
  submitFormTwoSchema,
  emailApplicationPackResponseSchema,
  postApplicationPackResponseSchema
}
