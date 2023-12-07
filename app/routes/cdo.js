const { cdoCreateDto } = require('../dto/cdo')
const { createCdo } = require('../repos/cdo')
const cdoCreateSchema = require('../schema/cdo/create')

module.exports = [{
  method: 'POST',
  path: '/cdo',
  options: {
    validate: {
      payload: cdoCreateSchema,
      failAction: (request, h, err) => {
        console.error(err)

        return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const created = await createCdo(request.payload)

      const res = cdoCreateDto(created)

      return h.response(res).code(200)
    }
  }
}]
