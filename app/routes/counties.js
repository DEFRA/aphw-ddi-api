const { county } = require('../data')

module.exports = {
  method: 'GET',
  path: '/counties',
  options: { tags: ['api'] },
  handler: async (request, h) => {
    const counties = await county.findAll({
      attributes: ['county']
    })

    return h.response({
      counties: counties.map(county => county.county)
    }).code(200)
  }
}
