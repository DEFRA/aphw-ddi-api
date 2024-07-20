const { purgeSoftDeletedRecords } = require('../overnight/purge-soft-deleted-records')
const { jobsQuerySchema, purgeSoftDeleteResponseSchema } = require('../schema/jobs')
const { purgeSoftDeletedDto } = require('../dto/overnight')
const { setExpiredInsuranceToBreach } = require('../overnight/expired-insurance')
const { getCallingUser } = require('../auth/get-user')

module.exports = [
  {
    method: 'POST',
    path: '/jobs/purge-soft-delete',
    options: {
      validate: {
        query: jobsQuerySchema,
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
  },
  {
    method: 'POST',
    path: '/jobs/expired-insurance',
    options: {
      validate: {
        query: jobsQuerySchema,
        failAction: (request, h, error) => {
          console.log(error)
          return h.response().code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const now = request.query.today
        const expiredInsuranceResponse = await setExpiredInsuranceToBreach(now, getCallingUser(request))

        return h.response({ response: expiredInsuranceResponse }).code(200)
      }
    }
  }
]
