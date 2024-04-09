const { processComments } = require('../import/access/backlog/process-comments')

module.exports = {
  method: 'GET',
  path: '/process-comments',
  handler: async (request, h) => {
    const maxRecords = request.query.maxRecords ? parseInt(request.query.maxRecords) : undefined
    const results = await processComments(maxRecords)

    return h.response(results).code(200)
  }
}
