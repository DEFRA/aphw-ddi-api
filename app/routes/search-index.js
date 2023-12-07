const { search } = require('../register/search-basic')

module.exports = [{
  method: 'GET',
  path: '/search/{type}/{terms}',
  handler: async (request, h) => {
    let results = null
    try {
      results = await search(request.params.type, request.params.terms)
    } catch (e) {
      console.log(e)
    }

    return h.response({ results }).code(200)
  }
}]
