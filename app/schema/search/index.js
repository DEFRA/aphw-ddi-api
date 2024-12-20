const Joi = require('joi')

const searchQueryParamsSchema = Joi.object({
  type: Joi.string().required(),
  terms: Joi.string().required()
})

const ownerAddress = Joi.string().optional().allow('').allow(null)

const searchResponseSchema = Joi.object({
  results: {
    results: Joi.array().items({
      searchType: Joi.string(),
      email: Joi.string().optional().allow('').allow(null),
      address: ownerAddress,
      dogIndex: Joi.string().optional().allow('').allow(null),
      dogName: Joi.string().optional().allow('').allow(null),
      dogStatus: Joi.string().optional().allow(null),
      dogSubStatus: Joi.string().optional().allow('').allow(null),
      personReference: Joi.string().optional(),
      firstName: Joi.string().optional().allow('').allow(null),
      lastName: Joi.string().optional().allow('').allow(null),
      microchipNumber: Joi.string().optional().allow('').allow(null),
      microchipNumber2: Joi.string().optional().allow('').allow(null),
      organisationName: Joi.string().optional().allow('').allow(null),
      dogId: Joi.number().optional().allow(null),
      personId: Joi.number().optional(),
      distance: Joi.number().optional(),
      rank: Joi.number().optional(),
      dogs: Joi.array().items({
        dogId: Joi.number().allow(null),
        dogIndex: Joi.string(),
        dogName: Joi.string().optional().allow('').allow(null),
        microchipNumber: Joi.string().optional().allow('').allow(null),
        microchipNumber2: Joi.string().optional().allow('').allow(null),
        dogStatus: Joi.string(),
        dogSubStatus: Joi.string().optional().allow('').allow(null)
      })
    }),
    totalFound: Joi.number().optional(),
    page: Joi.number().optional()
  }
})

module.exports = {
  searchQueryParamsSchema,
  searchResponseSchema
}
