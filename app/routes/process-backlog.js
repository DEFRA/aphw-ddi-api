const processBacklog = require('../import/process-backlog')

const buildConfig = (request) => ({
  maxRecords: request.query.maxRecords,
  includeFuzzyAlgo1: request.query.includeFuzzyAlgo1 === 'true',
  includeFuzzyAlgo2: request.query.includeFuzzyAlgo2 === 'true',
  includeSwappedNames: request.query.includeSwappedNames === 'true',
  validateOnly: request.query.validateOnly === 'true'
})

module.exports = {
  method: 'GET',
  path: '/process-backlog',
  handler: async (request, h) => {
    const config = buildConfig(request)
    let res = null
    try {
      res = await processBacklog.process(config)
    } catch (e) {
      console.log(e)
    }
    return h.response({
      rowsProcessed: res.stats.rowsProcessed,
      rowsInError: res.stats.rowsInError,
      dogRowsIntoDb: res.stats.dogRowsIntoDb,
      peopleRowsIntoDb: res.stats.peopleRowsIntoDb
    }).code(200)
  }
}
