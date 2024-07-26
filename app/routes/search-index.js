const { search } = require('../register/search-basic')

module.exports = [{
  method: 'GET',
  path: '/search/{type}/{terms}',
  options: { tags: ['api'] },
  handler: async (request, h) => {
    const results = await search(request.params.type, request.params.terms)
    return h.response({ results }).code(200)
  }
}]
