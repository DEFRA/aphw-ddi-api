const { createFakeCdos } = require('../repos/fake-data')

module.exports = [{
  method: 'GET',
  path: '/create-fake-data/{numRecords}',
  handler: async (request, h) => {
    const numRecords = request.params.numRecords
    await createFakeCdos(numRecords)
    return h.response('ok').code(200)
  }
}]
