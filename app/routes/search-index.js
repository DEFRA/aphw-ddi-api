const { search } = require('../register/search-basic')
const { searchQueryParamsSchema, searchResponseSchema } = require('../schema/search')

module.exports = [{
  method: 'GET',
  path: '/search/{type}/{terms}',
  options: {
    tags: ['api'],
    validate: {
      params: searchQueryParamsSchema,
      failAction: (request, h, error) => {
        return h.response().code(400).takeover()
      }
    },
    response: {
      schema: searchResponseSchema
    },
    handler: async (request, h) => {
      const results = await search(request.params.type, request.params.terms)
      return h.response({ results }).code(200)
    }
  }
}]
