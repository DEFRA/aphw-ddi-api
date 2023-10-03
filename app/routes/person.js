const addPerson = require('../person/add-person')
const { getPersonById } = require('../person/get-person')

module.exports = [{
  method: 'GET',
  path: '/person/{id}',
  handler: async (request, h) => {
    const id = request.params.id
    const person = await getPersonById(id)
    return h.response({ person }).code(200)
  }
},
{
  method: 'POST',
  path: '/person',
  handler: async (request, h) => {
    const payload = JSON.parse(request.payload)
    await addPerson(payload.people)

    return h.response('ok').code(200)
  }
}]
