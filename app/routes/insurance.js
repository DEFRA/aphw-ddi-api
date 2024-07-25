const { getCompanies, addCompany, deleteCompany } = require('../repos/insurance')
const { createAdminItem } = require('../schema/admin/create')
const { getCallingUser } = require('../auth/get-user')
const { insuranceQuerySchema } = require('../schema/admin/insurance')

const sortKeys = {
  updatedAt: 'updated_at',
  name: 'company_name'
}

module.exports = [
  {
    method: 'GET',
    path: '/insurance/companies',
    options: {
      tags: ['api'],
      validate: {
        query: insuranceQuerySchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const companies = await getCompanies({
          key: sortKeys[request.query.sortKey],
          order: request.query.sortOrder
        })

        return h.response({
          companies
        }).code(200)
      }
    }
  },
  {
    method: 'POST',
    path: '/insurance/companies',
    options: {
      tags: ['api'],
      validate: {
        payload: createAdminItem,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const { id, name } = await addCompany(request.payload, getCallingUser(request))

        return h.response({
          id,
          name
        }).code(201)
      }
    }
  },
  {
    method: 'DELETE',
    path: '/insurance/companies/{insuranceCompanyId}',
    options: { tags: ['api'] },
    handler: async (request, h) => {
      const insuranceCompanyId = request.params.insuranceCompanyId
      await deleteCompany(insuranceCompanyId, getCallingUser(request))

      return h.response().code(204)
    }
  }
]
