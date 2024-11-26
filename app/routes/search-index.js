const { search } = require('../search/search')
const { searchQueryParamsSchema, searchResponseSchema } = require('../schema/search')
const { auditSearch } = require('../dto/auditing/view')
const { getCallingUser } = require('../auth/get-user')

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
      await auditSearch(request.params.terms, getCallingUser(request))

      const results = await search(request.params.type, request.params.terms, !!request.query.fuzzy, !!request.query.national)

      return h.response({ results }).code(200)
    }
  }
}]
