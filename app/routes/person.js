const Joi = require('joi')
const { getCallingUser } = require('../auth/get-user')
const { getPersonByReference, getPersonAndDogsByReference, updatePerson, deletePerson } = require('../repos/people')
const { personDto, personAndDogsDto } = require('../dto/person')
const { schema: updateSchema } = require('../schema/person/update')
const { auditOwnerDetailsView, auditOwnerActivityView } = require('../dto/auditing/view')
const { scopes } = require('../constants/auth')

module.exports = [
  {
    method: 'GET',
    path: '/person/{reference?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          reference: Joi.string().required()
        }),
        failAction: (request, h, _error) => {
          return h.response().code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const ref = request.params.reference
        const includeDogs = request.query.includeDogs === 'true'
        const person = includeDogs ? await getPersonAndDogsByReference(ref) : await getPersonByReference(ref)

        if (person === null) {
          return h.response().code(204)
        }

        if (includeDogs) {
          await auditOwnerDetailsView(person, getCallingUser(request))
        } else {
          await auditOwnerActivityView(person, getCallingUser(request))
        }

        const result = includeDogs ? personAndDogsDto(person) : personDto(person)

        return h.response(result).code(200)
      }
    }
  },
  {
    method: 'PUT',
    path: '/person',
    options: {
      auth: { scope: scopes.internal },
      tags: ['api'],
      validate: {
        payload: updateSchema,
        failAction: (request, h, _error) => {
          return h.response().code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const person = request.payload

        try {
          const updated = await updatePerson(person, getCallingUser(request))

          return h.response(personDto(updated.updatedPerson)).code(200)
        } catch (err) {
          console.error('Error updating person:', err)

          if (err.type === 'NOT_FOUND') {
            return h.response().code(400)
          }

          throw err
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/person-and-force-change',
    options: {
      auth: { scope: scopes.internal },
      tags: ['api'],
      validate: {
        payload: updateSchema,
        failAction: (request, h, _error) => {
          return h.response().code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const person = request.payload

        try {
          const updated = await updatePerson(person, getCallingUser(request), null, true)

          return h.response({
            person: personDto(updated.updatedPerson),
            policeForceResult: updated.changedPoliceForceResult
          }).code(200)
        } catch (err) {
          console.error('Error updating person:', err)

          if (err.type === 'NOT_FOUND') {
            return h.response().code(400)
          }

          throw err
        }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/person/{reference?}',
    options: {
      auth: { scope: [scopes.admin] },
      validate: {
        params: Joi.object({
          reference: Joi.string().required()
        }),
        failAction: (request, h, _error) => {
          return h.response().code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const personAndDogs = await getPersonAndDogsByReference(request.params.reference)
        if (personAndDogs?.length && personAndDogs[0].dog) {
          return h.response().code(400)
        }

        await deletePerson(request.params.reference, getCallingUser(request))

        return h.response().code(200)
      }
    }
  }
]
