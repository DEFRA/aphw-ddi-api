const Joi = require('joi')

const schema = Joi.object({
  owner: Joi.object({
    firstName: Joi.any().required(),
    lastName: Joi.any().required(),
    address: {
      addressLine1: Joi.any().required(),
      addressLine2: Joi.any().optional(),
      town: Joi.any().required(),
      county: Joi.any().optional(),
      country: Joi.any().required(),
      postcode: Joi.any().required()
    },
    birthDate: Joi.date().iso().required(),
    phoneNumber: Joi.alternatives().try(
      Joi.number(),
      Joi.string().trim()
    ).required(),
    email: Joi.string().email().trim().required()
  }).required(),
  dog: Joi.object({
    name: Joi.any().required(),
    birthDate: Joi.date().iso().required(),
    colour: Joi.any().required(),
    gender: Joi.any().required(),
    insuranceStartDate: Joi.date().iso().required(),
    neutered: Joi.any().required(),
    microchipNumber: Joi.alternatives().try(
      Joi.string().trim(),
      Joi.number()
    ).optional().allow('').allow(null),
    indexNumber: Joi.number().required(),
    certificateIssued: Joi.date().iso().optional().allow('').allow(null)
  }).required()
})

const validate = (data) => {
  const result = schema.validate(data, { abortEarly: false, allowUnknown: true })

  return {
    isValid: result.error === undefined,
    errors: result.error ?? undefined
  }
}

module.exports = {
  schema,
  validate
}
