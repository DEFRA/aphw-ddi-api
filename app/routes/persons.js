// const { getPersonByReference, getPersonAndDogsByReference } = require('../repos/people')
// const { personDto, personAndDogsDto } = require('../dto/person')
const { personsFilter } = require('../schema/persons/get')

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
        // const filter = request.query
        // const includeDogs = request.query.includeDogs === 'true'
        // const person = includeDogs ? await getPersonAndDogsByReference(ref) : await getPersonByReference(ref)
        //
        // if (person === null) {
        //   return h.response().code(204)
        // }
        //
        // const result = includeDogs ? personAndDogsDto(person) : personDto(person)

        const result = {
          persons: []
        }
        return h.response(result).code(200)
      }
    }
  }
]
