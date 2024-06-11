
const Joi = require('joi')
const { getCallingUser } = require('../auth/get-user')
const { getPersonByReference, getPersonAndDogsByReference, updatePerson, deletePerson } = require('../repos/people')
const { personDto, personAndDogsDto } = require('../dto/person')
const { schema: updateSchema } = require('../schema/person/update')

module.exports = [{
  method: 'GET',
  path: '/person/{reference?}',
  options: {
    validate: {
      params: Joi.object({
        reference: Joi.string().required()
      }),
      failAction: (request, h, error) => {
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

      const result = includeDogs ? personAndDogsDto(person) : personDto(person)

      return h.response(result).code(200)
    }
  }
}, {
  method: 'PUT',
  path: '/person',
  options: {
    validate: {
      payload: updateSchema,
      failAction: (request, h, error) => {
        return h.response().code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const person = request.payload

      try {
        const updated = await updatePerson(person, getCallingUser(request))

        return h.response(personDto(updated)).code(200)
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
    validate: {
      params: Joi.object({
        reference: Joi.string().required()
      }),
      failAction: (request, h, error) => {
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
}]
