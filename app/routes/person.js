const Joi = require('joi')
const { getPersonByReference, getPersonAndDogsByReference, updatePerson } = require('../repos/people')
const { personDto, personAndDogsDto } = require('../dto/person')
const { schema: updateSchema } = require('../schema/person/update')

module.exports = [{
  method: 'GET',
  path: '/person/{reference}',
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

      console.log('person', JSON.parse(JSON.stringify(person)))
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
        const updated = await updatePerson(person)

        return h.response(personDto(updated)).code(200)
      } catch (err) {
        console.error(`Error updating person: ${err}`)

        if (err.type === 'NOT_FOUND') {
          return h.response().code(400)
        }

        throw err
      }
    }
  }
}]
