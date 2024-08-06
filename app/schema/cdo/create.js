const Joi = require('joi')

const createCdoRequestSchema = Joi.object({
  owner: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    dateOfBirth: Joi.string().optional().allow('').allow(null),
    personReference: Joi.string().optional().allow('').allow(null),
    address: Joi.object({
      addressLine1: Joi.string().required(),
      addressLine2: Joi.string().optional().allow('').allow(null),
      town: Joi.string().required(),
      postcode: Joi.string().required(),
      country: Joi.string().optional().allow('').allow(null)
    }).required()
  }).required(),
  enforcementDetails: Joi.object({
    court: Joi.string().optional().allow('').allow(null),
    policeForce: Joi.string().required(),
    legislationOfficer: Joi.string().allow(null).allow('').optional()
  }).required(),
  dogs: Joi.array().items(Joi.object({
    breed: Joi.string().required(),
    name: Joi.string().optional().allow('').allow(null),
    microchipNumber: Joi.string().optional().allow('').allow(null),
    applicationType: Joi.string().required(),
    cdoIssued: Joi.when('applicationType', { is: 'cdo', then: Joi.date().iso().required(), otherwise: Joi.optional() }),
    cdoExpiry: Joi.when('applicationType', { is: 'cdo', then: Joi.date().iso().required(), otherwise: Joi.optional() }),
    interimExemption: Joi.when('applicationType', { is: 'interim-exemption', then: Joi.date().iso().required(), otherwise: Joi.optional() }),
    status: Joi.string().optional().allow('').allow(null),
    indexNumber: Joi.string().optional().allow('').allow(null)
  })).min(1).required()
})

const createCdoResponseSchema = Joi.object({
  owner: {
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    birthDate: Joi.string().optional().allow('').allow(null),
    personReference: Joi.string().required(),
    address: Joi.object({
      addressLine1: Joi.string(),
      addressLine2: Joi.string().allow(null).allow(''),
      town: Joi.string().required(),
      postcode: Joi.string().required(),
      country: Joi.string().required()
    })
  },
  enforcementDetails: Joi.object({
    policeForce: Joi.string().allow(null).allow(''),
    court: Joi.string().allow(null).allow(''),
    legislationOfficer: Joi.string().allow(null).allow('')
  }),
  dogs: Joi.array().items(Joi.object({
    indexNumber: Joi.string(),
    name: Joi.string().optional().allow('').allow(null),
    status: Joi.string().required(),
    breed: Joi.string().required(),
    cdoIssued: Joi.date().allow(null),
    cdoExpiry: Joi.date().allow(null),
    microchipNumber: Joi.string().optional().allow('').allow(null),
    interimExemption: Joi.date().allow(null)
  }))
})

module.exports = { createCdoRequestSchema, createCdoResponseSchema }
