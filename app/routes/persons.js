const { personsQueryParamsSchema } = require('../schema/persons/get')
const { getPersons, deletePersons } = require('../repos/persons')
const { personDto } = require('../dto/person')
const { deletePayloadSchema, deleteResponseSchema, deleteQuerySchema } = require('../schema/persons/delete')
const { getCallingUser } = require('../auth/get-user')
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
  },
  {
    method: 'DELETE',
    path: '/persons',
    options: {
      validate: {
        payload: deletePayloadSchema,
        query: deleteQuerySchema,
        failAction: (request, h, error) => {
          return h.response().code(400).takeover()
        }
      },
      response: {
        schema: deleteResponseSchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      }
    },
    handler: async (request, h) => {
      const personReferences = request.query['personReferences[]']?.length ? request.query['personReferences[]'] : request.payload.personReferences

      if (!personReferences?.length) {
        return h.response().code(400).takeover()
      }

      const result = await deletePersons(personReferences, getCallingUser(request))
      return h.response(result).code(200)
    }
  }
]
