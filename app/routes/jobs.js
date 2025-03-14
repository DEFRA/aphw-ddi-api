const { purgeSoftDeletedRecords } = require('../overnight/purge-soft-deleted-records')
const { jobsQuerySchema, purgeSoftDeleteResponseSchema, defaultJobsResponse } = require('../schema/jobs')
const { purgeSoftDeletedDto } = require('../dto/overnight')
const { setExpiredInsuranceToBreach, addBreachReasonToExpiredInsurance } = require('../overnight/expired-insurance')
const { getCallingUser } = require('../auth/get-user')
const { setExpiredNeuteringDeadlineToInBreach, addBreachReasonToExpiredNeuteringDeadline } = require('../overnight/expired-neutering-deadline')
const { revertExpiredInsurance } = require('../overnight/revert-expired-insurance')
const { hasJobRunBefore } = require('../repos/regular-jobs')
const { scopes } = require('../constants/auth')

module.exports = [
  {
    method: 'POST',
    path: '/jobs/purge-soft-delete',
    options: {
      auth: { scope: [scopes.admin] },
      notes: ['Hard deletes/purges all the dog & owner records that we soft deleted more than x days ago (90)'],
      tags: ['api'],
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
      auth: { scope: [scopes.admin] },
      tags: ['api'],
      notes: ['Sets all the dog with expired insurance to In Breach'],
      response: {
        status: {
          200: defaultJobsResponse
        }
      },
      validate: {
        query: jobsQuerySchema,
        failAction: (request, h, error) => {
          console.log(error)
          return h.response().code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const now = request.query.today
        const insuranceRevertAlreadyRun = await hasJobRunBefore('Success Revert In-breach Insurance to Exempt')

        let revertResponse = ''
        if (!insuranceRevertAlreadyRun) {
          revertResponse = await revertExpiredInsurance(now, getCallingUser(request))
        }

        const addBreachResponse = await addBreachReasonToExpiredInsurance(now, getCallingUser(request))
        const expiredInsuranceResponse = await setExpiredInsuranceToBreach(now, getCallingUser(request))

        return h.response({ response: revertResponse + addBreachResponse + expiredInsuranceResponse }).code(200)
      }
    }
  },
  {
    method: 'POST',
    path: '/jobs/neutering-deadline',
    options: {
      auth: { scope: [scopes.admin] },
      tags: ['api'],
      notes: ['Sets dogs who have not neutered their dogs before the deadline to In Breach'],
      response: {
        status: {
          200: defaultJobsResponse
        }
      },
      validate: {
        query: jobsQuerySchema,
        failAction: (request, h, error) => {
          console.log(error)
          return h.response().code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const now = request.query.today
        const addBreachResponse = await addBreachReasonToExpiredNeuteringDeadline(now, getCallingUser(request))
        const expiredNeuteringDeadlineResponse = await setExpiredNeuteringDeadlineToInBreach(now, getCallingUser(request))

        return h.response({ response: addBreachResponse + expiredNeuteringDeadlineResponse }).code(200)
      }
    }
  }
]
