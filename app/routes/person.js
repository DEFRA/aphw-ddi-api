const Joi = require('joi')
const { getPersonByReference } = require("../repos/people")
const { personDto } = require("../dto/person")

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
      },
    },
    handler: async (request, h) => {
      const ref = request.params.reference
      const person = await getPersonByReference(ref)

      if (person === null) {
        return h.response().code(204)
      }

      return h.response(personDto(person)).code(200)
    }
  }
}]
