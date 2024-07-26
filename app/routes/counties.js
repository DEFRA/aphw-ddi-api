const { getCounties } = require('../repos/counties')

module.exports = {
  method: 'GET',
  path: '/counties',
  options: { tags: ['api'] },
  handler: async (request, h) => {
    const counties = await getCounties()

    return h.response({
      counties: counties.map(county => county.county)
    }).code(200)
  }
}
