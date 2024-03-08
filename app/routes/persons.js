// const { getPersonByReference, getPersonAndDogsByReference } = require('../repos/people')
// const { personDto, personAndDogsDto } = require('../dto/person')
const { personsFilter } = require('../schema/persons/get')
const { getPersons } = require('../repos/persons')
const { personDto } = require('../dto/person')

module.exports = [
  {
    method: 'GET',
    path: '/persons',
    options: {
      validate: {
        query: personsFilter,
        failAction: (request, h, error) => {
          return h.response().code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const filter = request.query
        const personDaos = await getPersons(filter)
        const persons = personDaos.map(personDto)

        const result = {
          persons
        }
        return h.response(result).code(200)
      }
    }
  }
]
