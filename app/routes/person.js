const addPerson = require('../person/add-person')
const { getPersonById } = require('../person/get-person')
const schema = require('../schema/people')

module.exports = [{
  method: 'GET',
  path: '/person/{id}',
  handler: async (request, h) => {
    const id = request.params.id
    const person = await getPersonById(id)

    if (person === null) {
      return h.response().code(204)
    }

    return h.response({ person }).code(200)
  }
},
{
  method: 'POST',
  path: '/person',
  options: {
    validate: {
      payload: schema,
      failAction: async (request, h, error) => {
        console.log(error)
        return h.response().code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const payload = request.payload
      const references = await addPerson(payload.people)
  
      return h.response({ references }).code(200)
    }
  }
}]
