const { county } = require('../data')

module.exports = {
  method: 'GET',
  path: '/counties',
  handler: async (request, h) => {
    const counties = await county.findAll()    

    return h.response({ counties }).code(200)
  }
}
