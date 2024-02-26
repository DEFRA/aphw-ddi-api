const { country } = require('../data')

module.exports = {
  method: 'GET',
  path: '/countries',
  options: { tags: ['api'] },
  handler: async (request, h) => {
    const countries = await country.findAll({
      attributes: ['country']
    })

    return h.response({
      countries: countries.map(country => country.country)
    }).code(200)
  }
}
