const { search } = require('../search/search')
const { searchQueryParamsSchema, searchResponseSchema } = require('../schema/search')
const { auditSearch } = require('../dto/auditing/view')
const { getCallingUser } = require('../auth/get-user')
const { getPageFromCache, saveResultsToCacheAndGetPageOne } = require('../search/search-processors/search-results-paginator')

const createResponse = (resp) => {
  if (resp?.status) {
    delete resp.status
  }
  return { results: resp }
}

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
      const user = getCallingUser(request)
      const cachedPage = await getPageFromCache(user, request)
      if (cachedPage?.status !== 200) {
        await auditSearch(request.params.terms, user)

        const results = await search(request.params.type, request.params.terms, !!request.query.fuzzy)
        const pageOne = await saveResultsToCacheAndGetPageOne(user, request, results)
        return h.response(createResponse(pageOne)).code(200)
      }

      return h.response(createResponse(cachedPage)).code(200)
    }
  }
}]
