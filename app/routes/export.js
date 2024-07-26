const { getCallingUser } = require('../auth/get-user')
const { EXPORT } = require('../constants/event/events')
const { sendEventToAudit } = require('../messaging/send-audit')
const { runExportNow } = require('../overnight/run-jobs')

module.exports = [{
  method: 'GET',
  path: '/export-audit',
  options: { tags: ['api'] },
  handler: async (request, h) => {
    await sendEventToAudit(EXPORT, 'DDI Export', 'Export data', getCallingUser(request))

    return h.response().code(200)
  }
},
{
  method: 'GET',
  path: '/export-create-file',
  options: { tags: ['api'] },
  handler: async (request, h) => {
    await runExportNow(request.query.batchSize)

    return h.response().code(200)
  }
}]
