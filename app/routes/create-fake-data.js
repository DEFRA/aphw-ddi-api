const { createFakeCdo } = require('../fake/create-fake-data')

module.exports = {
  method: 'GET',
  path: '/create-fake-data',
  handler: async (request, h) => {
    try {
      for (let i = 0; i < 20000; i++) {
        await createFakeCdo()
        console.log('Created CDO', i)
      }
    } catch (err) {
      console.log('Route err', err)
    }
    return h.response('ok').code(200)
  }
}
