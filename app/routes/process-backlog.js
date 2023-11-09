const processBacklog = require('../import/process-backlog')

module.exports = {
  method: 'GET',
  path: '/process-backlog',
  handler: async (request, h) => {
    let res = null
    try {
      res = await processBacklog.process()
    } catch (e) {
      console.log(e)
    }
    return h.response({
      rowsProcessed: res.rowsProcessed,
      rowsInError: res.rowsInError,
      rowsIntoDb: res.rowsIntoDb
    }).code(200)
  }
}
