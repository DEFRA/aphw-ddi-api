const { getCallingUser } = require('../auth/get-user')
const { EXPORT } = require('../constants/event/events')
const { sendEventToAudit } = require('../messaging/send-audit')
const { runExportNow } = require('../overnight/run-jobs')
const { exportCreateFileQuerySchema } = require('../schema/export')
const { scopes } = require('../constants/auth')

module.exports = [{
  method: 'GET',
  path: '/export-audit',
  options: {
    auth: { scope: [scopes.admin] },
    tags: ['api'],
    notes: ['Publishes an export event'],
    response: {
      status: {
        204: undefined
      }
    }
  },
  handler: async (request, h) => {
    await sendEventToAudit(EXPORT, 'DDI Export', 'Export data', getCallingUser(request))

    return h.response().code(204)
  }
},
{
  method: 'GET',
  path: '/export-create-file',
  options: {
    auth: { scope: [scopes.admin] },
    tags: ['api'],
    validate: {
      query: exportCreateFileQuerySchema
    },
    response: {
      status: {
        204: undefined
      }
    }
  },
  handler: async (request, h) => {
    await runExportNow(request.query.batchSize)

    return h.response().code(204)
  }
}]
