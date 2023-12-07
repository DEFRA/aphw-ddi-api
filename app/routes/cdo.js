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
      const res = await createCdo(request.payload)

      return h.response(res).code(200)
    }
  }
}]
