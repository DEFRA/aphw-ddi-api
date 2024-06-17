const { purgeSoftDeletedRecords } = require('../overnight/purge-soft-deleted-records')
const { purgeSoftDelete } = require('../schema/jobs')

module.exports = {
  method: 'POST',
  path: '/jobs/purge-soft-delete',
  options: {
    validate: {
      query: purgeSoftDelete,
      failAction: (request, h, error) => {
        console.log(error)
        return h.response().code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const now = request.query.today
      const purgeSoftDeletedRecordsResponse = await purgeSoftDeletedRecords(now)

      return h.response(purgeSoftDeletedRecordsResponse).code(200)
    }
  }
}
