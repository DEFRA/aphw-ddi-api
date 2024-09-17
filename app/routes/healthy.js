const { okSchema } = require('../schema/common/response/ok')
module.exports = {
  method: 'GET',
  path: '/healthy',
  options: {
    auth: false,
    tags: ['api'],
    response: {
      schema: okSchema
    },
    notes: ['Health endpoint']
  },
  handler: async (request, h) => {
    return h.response('ok').code(200)
  }
}
