const { County } = require('../data')

module.exports = {
  method: 'GET',
  path: '/counties',
  handler: async (request, h) => {
    const counties = await County.findAll()    
    return h.response({ counties }).code(200)
  }
}
