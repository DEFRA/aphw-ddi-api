const { getCounties } = require('../repos/counties')
const { countiesResponseSchema } = require('../schema/counties')

module.exports = {
  method: 'GET',
  path: '/counties',
  options: {
    tags: ['api'],
    notes: ['Returns a list of counties stores on the DB'],
    response: {
      schema: countiesResponseSchema
    }
  },
  handler: async (request, h) => {
    const counties = await getCounties()

    return h.response({
      counties: counties.map(county => county.county)
    }).code(200)
  }
}
