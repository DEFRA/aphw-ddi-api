const { getBreeds } = require('../repos/dogs')

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
