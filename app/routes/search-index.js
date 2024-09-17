const { search } = require('../register/search')
const { searchQueryParamsSchema, searchResponseSchema } = require('../schema/search')
const { userInfoAudit } = require('../dto/auditing/user')

module.exports = [{
  method: 'GET',
  path: '/search/{type}/{terms}',
  options: {
    tags: ['api'],
    validate: {
      params: searchQueryParamsSchema
    },
    response: {
      schema: searchResponseSchema,
      failAction: (request, h, error) => {
        console.error('search response schema error', error)
        return h.response().code(400).takeover()
      }
    },
    handler: async (request, h) => {
      await userInfoAudit(request)

      const results = await search(request.params.type, request.params.terms, !!request.query.fuzzy)
      return h.response({ results }).code(200)
    }
  }
}]
