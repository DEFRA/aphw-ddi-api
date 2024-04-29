const Joi = require('joi')

const schema = Joi.object({
  owner: Joi.object({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    address: Joi.object({
      addressLine1: Joi.string().trim().required(),
      addressLine2: Joi.string().trim().optional(),
      town: Joi.string().trim().required(),
      county: Joi.string().trim().optional(),
      country: Joi.string().trim().required(),
      postcode: Joi.string().trim().required()
    }).required(),
    birthDate: Joi.any().required(),
    phoneNumber: Joi.alternatives().try(
      Joi.number(),
      Joi.string().trim()
    ).required(),
    email: Joi.string().email().trim().required()
  }).required(),
  dog: Joi.object({
    name: Joi.string().trim().required(),
    birthDate: Joi.any().required(),
    colour: Joi.string().trim().required(),
    gender: Joi.string().trim().required(),
    insuranceStartDate: Joi.any().required(),
    microchipNumber: Joi.alternatives().try(
      Joi.string().trim(),
      Joi.number().unsafe()
    ).optional().allow('').allow(null),
    indexNumber: Joi.number().required(),
    certificateIssued: Joi.any().optional().allow('').allow(null)
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
