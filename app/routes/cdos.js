const { getSummaryCdos } = require('../repos/cdo')
const { mapSummaryCdoDaoToDto } = require('../repos/mappers/cdo')
const { getCdosQuerySchema, getCdosResponseSchema } = require('../schema/cdos/get')

module.exports = [
  {
    method: 'GET',
    path: '/cdos',
    options: {
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
            sortOrder: order
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

          const summaryCdos = await getSummaryCdos(filter, sort)

          const summaryCdosDto = summaryCdos.map(mapSummaryCdoDaoToDto)

          return h.response({ cdos: summaryCdosDto }).code(200)
        } catch (e) {
          console.log('Error retrieving cdos:', e)
          throw e
        }
      }
    }

  }
]
