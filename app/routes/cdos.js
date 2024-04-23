const { getSummaryCdos } = require('../repos/cdo')
const { mapSummaryCdoDaoToDto } = require('../repos/mappers/cdo')

module.exports = [
  {
    method: 'GET',
    path: '/cdos',
    handler: async (request, h) => {
      try {
        const statusQuery = request.query.status || []
        const withinDays = parseInt(request.query.withinDays)
        const status = Array.isArray(statusQuery) ? statusQuery : [statusQuery]

        /**
         * @type {{ status?: CdoStatus[]; withinDays?: number }}
         */
        const filter = {}

        if (status.length) {
          filter.status = status
        }

        if (!isNaN(withinDays)) {
          filter.withinDays = withinDays
        }

        if (!Object.keys(filter).length) {
          return h.response('Not implemented, please call with a filter').code(501)
        }

        const summaryCdos = await getSummaryCdos(filter)

        return h.response({ cdos: summaryCdos.map(mapSummaryCdoDaoToDto) }).code(200)
      } catch (e) {
        console.log(`Error retrieving cdos: ${e}`)
        throw e
      }
    }
  }
]
