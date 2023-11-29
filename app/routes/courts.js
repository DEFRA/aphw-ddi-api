const { getCourts } = require('../repos/courts')

module.exports = {
  method: 'GET',
  path: '/courts',
  handler: async (request, h) => {
    const courts = await getCourts()

    return h.response({
      courts
    }).code(200)
  }
}
