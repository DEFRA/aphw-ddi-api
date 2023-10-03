const addPerson = require('../person/add-person')

module.exports = {
  method: 'POST',
  path: '/person',
  handler: async (request, h) => {
    const payload = request.payload
    await addPerson(payload)

    return h.response('ok').code(200)
  }
}
