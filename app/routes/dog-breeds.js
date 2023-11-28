const { getBreeds } = require('../repos/dog')

module.exports = {
  method: 'GET',
  path: '/dog-breeds',
  handler: async (request, h) => {
    const breeds = await getBreeds()

    return h.response({
      breeds
    }).code(200)
  }
}
