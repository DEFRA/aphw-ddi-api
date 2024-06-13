const { statisticsQuerySchema } = require('../schema/admin/statistics')
const { getCountsPerStatus } = require('../repos/statistics')
const { countsPerStatusDto } = require('../dto/statistics')

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
      const counts = await getCountsPerStatus()

      return h.response(countsPerStatusDto(counts)).code(200)
    }
  }
}
