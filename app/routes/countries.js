const { getCountries } = require('../repos/countries')

module.exports = {
  method: 'GET',
  path: '/countries',
  options: { tags: ['api'] },
  handler: async (request, h) => {
    const countries = await getCountries()

    return h.response({
      countries: countries.map(country => country.country)
    }).code(200)
  }
}
