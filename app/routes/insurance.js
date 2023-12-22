const { getCompanies } = require('../repos/insurance')

module.exports = {
  method: 'GET',
  path: '/insurance/companies',
  handler: async (request, h) => {
    const companies = await getCompanies()

    return h.response({
      companies
    }).code(200)
  }
}
