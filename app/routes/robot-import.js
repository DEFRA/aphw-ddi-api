const { processRobotImport } = require('../import/robot-import')

module.exports = [{
  method: 'POST',
  path: '/robot-import',
  handler: async (request, h) => {
    if (request.headers['content-type'] !== 'application/json') {
      return h.response().code(400)
    }

    const payload = request.payload
    const res = await processRobotImport(payload)
    if (res?.stats?.errors?.length > 0) {
      return h.response(res).code(400)
    }
    return h.response(res).code(200)
  }
}]
