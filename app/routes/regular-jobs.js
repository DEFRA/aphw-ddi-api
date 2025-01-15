const { getRegularJobs } = require('../repos/regular-jobs')
const { scopes } = require('../constants/auth')

module.exports = {
  method: 'GET',
  path: '/regular-jobs',
  options: {
    auth: { scope: [scopes.admin] },
    handler: async (request, h) => {
      const jobs = await getRegularJobs()

      return h.response({
        jobs
      }).code(200)
    }
  }
}
