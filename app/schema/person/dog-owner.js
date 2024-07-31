const Joi = require('joi')

const dogOwnerDogSchema = Joi.object({
  breed: Joi.string(),
  colour: Joi.string().allow('').allow(null),
  dogReference: Joi.string(),
  id: Joi.number(),
  indexNumber: Joi.string(),
  microchipNumber: Joi.string().allow('').allow(null),
  microchipNumber2: Joi.string().allow('').allow(null),
  name: Joi.string().allow('').allow(null),
  sex: Joi.string().allow('').allow(null),
  status: 'Interim exempt',
  tattoo: Joi.string().allow('').allow(null),
  birthDate: Joi.string().allow('').allow(null)
})

const dogOwnerResponseSchema = Joi.object({
  owner: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    birthDate: Joi.date().allow(null),
    personReference: Joi.string().required(),
    address: Joi.object({
      addressLine1: Joi.string().required(),
      addressLine2: Joi.string().allow(null).allow(''),
      town: Joi.string().required(),
      postcode: Joi.string().required(),
      country: Joi.string().allow(null)
    }),
    contacts: Joi.alternatives().try(
      Joi.object({
        email: Joi.string().allow(null).allow(''),
        primaryTelephone: Joi.string().allow(null).allow(''),
        secondaryTelephone: Joi.string().allow(null).allow('')
      }),
      Joi.array()
    ),
    dogs: Joi.array().items(dogOwnerDogSchema).optional()
  }).unknown()
})

const dogOwnerQuerySchema = Joi.object({
  includeDogs: Joi.boolean().optional()
})

module.exports = {
  dogOwnerResponseSchema,
  dogOwnerQuerySchema
}
