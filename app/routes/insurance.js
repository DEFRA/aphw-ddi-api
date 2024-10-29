const { getCompanies, addCompany, deleteCompany } = require('../repos/insurance')
const { createAdminItem } = require('../schema/admin/create')
const { getCallingUser } = require('../auth/get-user')
const { insuranceQuerySchema, getInsuranceCompaniesResponseSchema, insuranceCompanySchema } = require('../schema/admin/insurance')
const { conflictSchema } = require('../schema/common/response/conflict')
const { scopes } = require('../constants/auth')

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
      notes: ['Gets all the active insurance companies on DDI'],
      response: {
        status: {
          200: getInsuranceCompaniesResponseSchema
        }
      },
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
      auth: { scope: [scopes.admin] },
      tags: ['api'],
      notes: ['Add a new insurance company'],
      response: {
        status: {
          200: insuranceCompanySchema,
          409: conflictSchema
        }
      },
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
    options: {
      auth: { scope: [scopes.admin] },
      tags: ['api'],
      notes: ['Deletes insurance company with insurance Company Id'],
      response: {
        status: {
          204: undefined,
          404: undefined
        }
      }
    },
    handler: async (request, h) => {
      const insuranceCompanyId = request.params.insuranceCompanyId
      await deleteCompany(insuranceCompanyId, getCallingUser(request))

      return h.response().code(204)
    }
  }
]
