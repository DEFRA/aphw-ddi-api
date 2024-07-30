const { getCountries } = require('../repos/countries')
const { countriesResponseSchema } = require('../schema/countries')

module.exports = {
  method: 'GET',
  path: '/countries',
  options: {
    tags: ['api'],
    notes: ['Returns a list of countries that are part of the DDI scheme'],
    response: {
      schema: countriesResponseSchema
    }
  },
  handler: async (request, h) => {
    const countries = await getCountries()

    return h.response({
      countries: countries.map(country => country.country)
    }).code(200)
  }
}
