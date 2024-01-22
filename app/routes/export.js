const { getCallingUser } = require('../auth/get-user')
const { getAllCdos } = require('../repos/cdo')
const { convertToCsv } = require('../export/csv')
const { EXPORT } = require('../constants/event/events')
const { sendEventToAudit } = require('../messaging/send-audit')

module.exports = {
  method: 'GET',
  path: '/export',
  handler: async (request, h) => {
    const cdos = await getAllCdos()
    const csv = convertToCsv(cdos)
    await sendEventToAudit(EXPORT, 'DDI Export', 'Export data', getCallingUser(request))

    return h.response({
      csv
    }).code(200)
  }
}
