const { processComments } = require('../import/access/backlog/process-comments')

// const buildConfig = (request) => ({
//   maxRecords: request.query.maxRecords,
//   includeFuzzyAlgo1: request.query.includeFuzzyAlgo1 === 'true',
//   includeFuzzyAlgo2: request.query.includeFuzzyAlgo2 === 'true',
//   includeSwappedNames: request.query.includeSwappedNames === 'true',
//   validateOnly: request.query.validateOnly === 'true'
// })

module.exports = {
  method: 'GET',
  path: '/process-comments',
  handler: async (request, h) => {
    const maxRecords = request.query.maxRecords ? parseInt(request.query.maxRecords) : undefined
    const results = await processComments(maxRecords)

    return h.response(results).code(200)
  }
}
