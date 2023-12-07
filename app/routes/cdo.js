const { createCdo } = require('../repos/cdo')

module.exports = [{
  method: 'POST',
  path: '/cdo',
  options: {
    handler: async (request, h) => {
      const res = await createCdo(request.payload)

      return h.response(res).code(200)
    }
  }
}]
