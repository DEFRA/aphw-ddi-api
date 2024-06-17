const { purgeSoftDeletedRecords } = require('../overnight/purge-soft-deleted-records')

module.exports = {
  method: 'POST',
  path: '/jobs/purge-soft-delete',
  handler: async (request, h) => {
    const purgeSoftDeletedRecordsResponse = await purgeSoftDeletedRecords()

    return h.response(purgeSoftDeletedRecordsResponse).code(200)
  }
}
