const Joi = require('joi')

const cdoPersonAddressResponseSchema = Joi.object({
  id: Joi.number().required(),
  person_id: Joi.number().required(),
  address_id: Joi.number().required(),
  address: Joi.object({
    id: Joi.number().required(),
    address_line_1: Joi.string().required(),
    address_line_2: Joi.string().allow(null).allow(''),
    town: Joi.string().required(),
    postcode: Joi.string().required(),
    county: Joi.string().allow(null),
    country_id: Joi.number().required(),
    country: {
      id: Joi.number().required(),
      country: Joi.string()
    }
  })
}).unknown()

const personContacts = Joi.object({
  id: Joi.number(),
  person_id: Joi.number(),
  contact_id: Joi.number(),
  contact: Joi.object({
    id: Joi.number(),
    contact: Joi.string().allow(null).allow(''),
    contact_type_id: Joi.number(),
    contact_type: Joi.object({
      id: Joi.number(),
      contact_type: Joi.string()
    })
  })
}).unknown()

const cdoPersonResponseSchema = Joi.object({
  id: Joi.number().required(),
  personReference: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  dateOfBirth: Joi.date().allow(null),
  addresses: Joi.array().items(cdoPersonAddressResponseSchema),
  person_contacts: Joi.array().items(personContacts),
  organisationName: Joi.string().allow('').allow(null)
}).unknown()

const cdoDogResponseSchema = Joi.object({
  id: Joi.number().required(),
  dogReference: Joi.string().required(),
  indexNumber: Joi.string().required(),
  name: Joi.string().allow('').allow(null),
  breed: Joi.string().required(),
  status: Joi.string().required(),
  subStatus: Joi.string().optional().allow('').allow(null),
  dateOfBirth: Joi.date().allow(null),
  dateOfDeath: Joi.date().allow(null),
  tattoo: Joi.string().allow('').allow(null),
  colour: Joi.string().allow('').allow(null),
  sex: Joi.string().allow('').allow(null),
  dateExported: Joi.date().allow(null),
  dateStolen: Joi.date().allow(null),
  dateUntraceable: Joi.date().allow(null),
  microchipNumber: Joi.string().allow('').allow(null),
  microchipNumber2: Joi.string().allow('').allow(null),
  breaches: Joi.array().items(Joi.string())
}).unknown()

const cdoExemptionResponseSchema = Joi.object({
  exemptionOrder: Joi.string().allow('').allow(null).optional(),
  cdoIssued: Joi.date().allow(null),
  cdoExpiry: Joi.date().allow(null),
  court: Joi.string().allow(null).allow(''),
  policeForce: Joi.string().allow(null).allow(''),
  legislationOfficer: Joi.string().allow(null).allow(''),
  certificateIssued: Joi.date().allow(null),
  applicationFeePaid: Joi.date().allow(null),
  insurance: Joi.array().items(Joi.object({
    company: Joi.string(),
    insuranceRenewal: Joi.date()
  })),
  neuteringConfirmation: Joi.date().allow(null),
  microchipVerification: Joi.date().allow(null),
  joinedExemptionScheme: Joi.date().allow(null),
  nonComplianceLetterSent: Joi.date().allow(null)
}).unknown()

const getCdoByIndexNumberSchema = Joi.object({
  cdo: Joi.object({
    person: cdoPersonResponseSchema,
    dog: cdoDogResponseSchema,
    exemption: cdoExemptionResponseSchema
  })
}).unknown()

module.exports = {
  getCdoByIndexNumberSchema
}
