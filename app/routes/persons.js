const { personsQueryParamsSchema } = require('../schema/persons/get')
const { getPersons } = require('../repos/persons')
const { personDto } = require('../dto/person')
/**
 * @typedef GetPersonsQuery
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [dateOfBirth]
 * @property {boolean} [orphaned]
 * @property {number} [limit]
 * @property {string} [sortKey]
 * @property {string} [sortOrder]
 */
module.exports = [
  {
    method: 'GET',
    path: '/persons',
    options: {
      validate: {
        query: personsQueryParamsSchema,
        failAction: (request, h, error) => {
          return h.response().code(400).takeover()
        }
      },
      handler: async (request, h) => {
        /**
         * @type {GetPersonsQuery}
         */
        const query = request.query
        const { sortKey, sortOrder, limit, ...filter } = query
        const order = {
          sortKey, sortOrder, limit
        }
        const personDaos = await getPersons(filter, order)
        const persons = personDaos.map(personDto)

        const result = {
          persons
        }
        return h.response(result).code(200)
      }
    }
  }
]
