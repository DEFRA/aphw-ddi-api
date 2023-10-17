const { search, addToSearchIndex } = require('../register/search-index')

module.exports = [{
  method: 'GET',
  path: '/search/{id}',
  handler: async (request, h) => {
    await addToSearchIndex()
    let searchIndex = null
    try {
      searchIndex = await search()
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
