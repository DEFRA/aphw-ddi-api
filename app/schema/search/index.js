const Joi = require('joi')

const searchQueryParamsSchema = Joi.object({
  type: Joi.string().required(),
  terms: Joi.string().required()
})

const searchResponseAddress = Joi.object({
  address_line_1: Joi.string().optional().allow('').allow(null),
  address_line_2: Joi.string().optional().allow('').allow(null),
  town: Joi.string().optional().allow('').allow(null),
  postcode: Joi.string().optional().allow('').allow(null)
}).optional()

const searchResponseSchema = Joi.object({
  results: Joi.array().items({
    email: Joi.string().optional().allow('').allow(null),
    address: searchResponseAddress,
    dogIndex: Joi.string().optional().allow('').allow(null),
    dogName: Joi.string().optional().allow('').allow(null),
    dogStatus: Joi.string().optional().allow(null),
    personReference: Joi.string().optional(),
    firstName: Joi.string().optional().allow('').allow(null),
    lastName: Joi.string().optional().allow('').allow(null),
    microchipNumber: Joi.string().optional().allow('').allow(null),
    microchipNumber2: Joi.string().optional().allow('').allow(null),
    organisationName: Joi.string().optional().allow('').allow(null),
    dogId: Joi.number().optional().allow(null),
    personId: Joi.number().optional(),
    distance: Joi.number().optional(),
    rank: Joi.number().optional()
  })
})

module.exports = {
  searchQueryParamsSchema,
  searchResponseSchema
}
