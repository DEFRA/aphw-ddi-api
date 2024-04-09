const { getRegularJobs } = require('../repos/regular-jobs')

module.exports = {
  method: 'GET',
  path: '/regular-jobs',
  handler: async (request, h) => {
    const jobs = await getRegularJobs()

    return h.response({
      jobs
    }).code(200)
  }
}
