const Joi = require('joi')

const searchQueryParamsSchema = Joi.object({
  type: Joi.string().required(),
  terms: Joi.string().required()
})

const searchResponseAddress = Joi.object({
  address_line_1: Joi.string().optional().allow(''),
  address_line_2: Joi.string().optional().allow(''),
  town: Joi.string().optional().allow(''),
  postcode: Joi.string().optional().allow('')
}).optional()

const searchResponseSchema = Joi.object({
  results: Joi.array().items({
    email: Joi.string().optional().allow(''),
    address: searchResponseAddress,
    dogIndex: Joi.string().optional().allow(''),
    dogName: Joi.string().optional().allow(''),
    dogStatus: Joi.string().optional(),
    personReference: Joi.string().optional(),
    firstName: Joi.string().optional().allow(''),
    lastName: Joi.string().optional().allow(''),
    microchipNumber: Joi.string().optional().allow(''),
    microchipNumber2: Joi.string().optional().allow(''),
    organisationName: Joi.string().optional().allow(''),
    dogId: Joi.number().optional(),
    personId: Joi.number().optional(),
    distance: Joi.number().optional(),
    rank: Joi.number().optional()
  })
})

module.exports = {
  searchQueryParamsSchema,
  searchResponseSchema
}
