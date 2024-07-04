const { statisticsQuerySchema } = require('../schema/admin/statistics')
const { getCountsPerStatus, getCountsPerCountry } = require('../repos/statistics')
const { countsPerStatusDto, countsPerCountryDto } = require('../dto/statistics')

const queryCountsPerStatus = 'countsPerStatus'
const queryCountsPerCountry = 'countsPerCountry'

module.exports = {
  method: 'GET',
  path: '/statistics',
  options: {
    validate: {
      query: statisticsQuerySchema,
      failAction: (request, h, err) => {
        console.error(err)

        return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const queryName = request.query.queryName

      let results
      if (queryName === queryCountsPerStatus) {
        const counts = await getCountsPerStatus()
        results = countsPerStatusDto(counts)
      } else if (queryName === queryCountsPerCountry) {
        const counts = await getCountsPerCountry()
        results = countsPerCountryDto(counts)
      }

      return h.response(results).code(200)
    }
  }
}
