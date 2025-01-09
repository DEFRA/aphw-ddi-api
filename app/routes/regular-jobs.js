const { getRegularJobs } = require('../repos/regular-jobs')
const { scopes } = require('../constants/auth')
const { emailApplicationPack } = require('../lib/email-helper')
const { getCallingUser } = require('../auth/get-user')

module.exports = {
  method: 'GET',
  path: '/regular-jobs',
  options: {
    auth: { scope: [scopes.admin] },
    handler: async (request, h) => {
      const jobs = await getRegularJobs()

      const dog = {
        indexNumber: 'ED12345',
        name: 'Rex'
      }
      const person = {
        email: 'jeremy.barnsley@defra.gov.uk',
        firstName: 'John',
        lastName: 'Smith'
      }

      await emailApplicationPack(person, dog, getCallingUser(request))

      return h.response({
        jobs
      }).code(200)
    }
  }
}
