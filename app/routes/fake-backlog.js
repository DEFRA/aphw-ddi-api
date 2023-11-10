const createFake = require('../import/create-fake-data')

module.exports = {
  method: 'GET',
  path: '/fake-backlog',
  handler: async (request, h) => {
    let rowsProcessed = null
    try {
      rowsProcessed = await createFake.createFakePeople()
    } catch (e) {
      console.log(e)
    }
    return h.response({
      rowsProcessed
    }).code(200)
  }
}
