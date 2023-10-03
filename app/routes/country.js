const { Country } = require('../data')

module.exports = {
  method: 'GET',
  path: '/countries',
  handler: async (request, h) => {
    const countries = await Country.findAll()
    return h.response({ countries }).code(200)
  }
}
