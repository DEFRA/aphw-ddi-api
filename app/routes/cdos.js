const { getSummaryCdos, getCdoCounts } = require('../repos/cdo')
const { mapSummaryCdoDaoToDto, mapSummaryCdoDaoToDtoWithTasks } = require('../repos/mappers/cdo')
const { getCdosQuerySchema, getCdosResponseSchema } = require('../schema/cdos/get')
const { scopes } = require('../constants/auth')
const getCache = require('../cache/get-cache')

module.exports = [
  {
    method: 'GET',
    path: '/cdos',
    options: {
      tags: ['api'],
      auth: { scope: scopes.internal },
      notes: ['Returns filtered summary list of cdos'],
      validate: {
        query: getCdosQuerySchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      response: {
        schema: getCdosResponseSchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        try {
          const {
            status,
            withinDays,
            nonComplianceLetterSent,
            sortKey: key,
            sortOrder: order,
            noCache
          } = request.query

          /**
           * @type {{ status?: CdoStatus[]; withinDays?: number; nonComplianceLetterSent?: boolean }}
           */
          const filter = {
            status,
            withinDays,
            nonComplianceLetterSent
          }

          let sort

          if (key || order) {
            sort = { key, order }
          }

          const cache = getCache(request)

          const summaryCdos = await getSummaryCdos(filter, sort, cache)
          const counts = await getCdoCounts(cache, noCache)

          const summaryMapper = request.query.showTasks ? mapSummaryCdoDaoToDtoWithTasks : mapSummaryCdoDaoToDto

          const summaryCdosDto = summaryCdos.cdos.map(summaryMapper)
          const count = summaryCdos.count

          return h.response({ cdos: summaryCdosDto, count, counts }).code(200)
        } catch (e) {
          console.log('Error retrieving cdos:', e)
          throw e
        }
      }
    }

  }
]
