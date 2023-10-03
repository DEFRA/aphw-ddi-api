const { country } = require('../data')

module.exports = {
  method: 'GET',
  path: '/countries',
  handler: async (request, h) => {
    const countries = await country.findAll()
    return h.response({ countries }).code(200)
  }
}
