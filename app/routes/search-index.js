const { search } = require('../register/search-index')

module.exports = [{
  method: 'GET',
  path: '/search/{reference}',
  handler: async (request, h) => {
    let searchIndex = null
    try {
      searchIndex = await search(request.params.reference)
    } catch (e) {
      console.log(e)
    }

    return h.response({ searchIndex }).code(200)
  }
},
{
  method: 'POST',
  path: '/search',
  handler: async (request, h) => {
    return h.response('ok').code(200)
  }
}]
