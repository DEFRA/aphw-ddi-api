const { okSchema } = require('../schema/common/response/ok')
module.exports = {
  method: 'GET',
  path: '/healthz',
  options: {
    auth: false,
    tags: ['api'],
    response: {
      schema: okSchema
    },
    notes: ['Health endpoint']
  },
  handler: (request, h) => {
    return h.response('ok').code(200)
  }
}
