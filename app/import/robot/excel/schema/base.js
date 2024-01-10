const Joi = require('joi')

const processDate = (value, helpers) => {
  if (value instanceof Date) {
    return value
  }

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return helpers.error('any.invalid')
  }

  return date
}

const processTelephone = (value, helpers) => {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return `0${value}`
  }

  return helpers.error('any.invalid')
}

const schema = Joi.object({
  person: Joi.object({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    addressLine1: Joi.string().trim().required(),
    addressLine2: Joi.string().trim().optional(),
    townOrCity: Joi.string().trim().required(),
    county: Joi.string().trim().optional(),
    country: Joi.string().trim().required(),
    postcode: Joi.string().trim().required(),
    birthDate: Joi.alternatives(
      Joi.date().iso(),
      Joi.string().trim().custom(processDate)
    ).required(),
    phoneNumber: Joi.alternatives().try(
      Joi.string().trim(),
      Joi.number().custom(processTelephone)
    ).required(),
    email: Joi.string().trim().required()
  }).required(),
  dog: Joi.object({
    name: Joi.string().trim().required(),
    birthDate: Joi.alternatives(
      Joi.date().iso(),
      Joi.string().custom(processDate)
    ).required(),
    colour: Joi.string().trim().required(),
    gender: Joi.string().trim().required(),
    insuranceStartDate: Joi.alternatives(
      Joi.date().iso(),
      Joi.string().trim().custom(processDate)
    ).required(),
    neutered: Joi.string().trim().required(),
    microchipped: Joi.string().trim().required(),
    microchipNumber: Joi.alternatives().try(
      Joi.string().trim(),
      Joi.number()
    ).required(),
    indexNumber: Joi.number().required()
  }).required()
})

const validate = (data) => {
  const result = schema.validate(data, { abortEarly: false })

  return {
    isValid: result.error === undefined,
    errors: result.error ?? undefined
  }
}

module.exports = {
  schema,
  validate
}
