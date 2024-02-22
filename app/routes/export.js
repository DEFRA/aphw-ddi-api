const { getCallingUser } = require('../auth/get-user')
const { readExportFile } = require('../export/read-export-file')
const { EXPORT } = require('../constants/event/events')
const { sendEventToAudit } = require('../messaging/send-audit')
const { runOvernightJobs } = require('../repos/regular-jobs')

module.exports = [{
  method: 'GET',
  path: '/export',
  handler: async (request, h) => {
    const csv = await readExportFile()

    await sendEventToAudit(EXPORT, 'DDI Export', 'Export data', getCallingUser(request))

    return h.response({
      csv
    }).code(200)
  }
},
{
  method: 'GET',
  path: '/trigger-overnight',
  handler: async (request, h) => {
    runOvernightJobs()

    return h.response().code(200)
  }
}]
