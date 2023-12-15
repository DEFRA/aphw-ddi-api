const Joi = require('joi')
const { getPersonByReference, getPersonAndDogsByReference } = require('../repos/people')
const { personDto, personAndDogsDto } = require('../dto/person')

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

      const result = includeDogs ? personAndDogsDto(person) : personDto(person)

      return h.response(result).code(200)
    }
  }
}]
