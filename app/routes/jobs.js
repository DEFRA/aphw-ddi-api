const { purgeSoftDeletedRecords } = require('../overnight/purge-soft-deleted-records')
const { purgeSoftDeleteQuerySchema, purgeSoftDeleteResponseSchema } = require('../schema/jobs')
const { purgeSoftDeletedDto } = require('../dto/overnight')

module.exports = {
  method: 'POST',
  path: '/jobs/purge-soft-delete',
  options: {
    validate: {
      query: purgeSoftDeleteQuerySchema,
      failAction: (request, h, error) => {
        console.log(error)
        return h.response().code(400).takeover()
      }
    },
    response: {
      schema: purgeSoftDeleteResponseSchema
    },
    handler: async (request, h) => {
      const now = request.query.today
      const purgeSoftDeletedRecordsResponse = await purgeSoftDeletedRecords(now)

      return h.response(purgeSoftDeletedDto(purgeSoftDeletedRecordsResponse)).code(200)
    }
  }
}
