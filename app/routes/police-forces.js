const { getPoliceForces, addForce, deleteForce, getPoliceForceByShortName } = require('../repos/police-forces')
const { createAdminItem } = require('../schema/admin/create')
const { getCallingUser } = require('../auth/get-user')
const { getPoliceForceResponseSchema, getPoliceForcesResponseSchema, policeForceSchema } = require('../schema/police-forces')
const { mapPoliceForceDaoToDto } = require('../dto/police-force')
const { conflictSchema } = require('../schema/common/response/conflict')
const { notFoundSchema } = require('../schema/common/response/not-found')
const { scopes } = require('../constants/auth')

module.exports = [
  {
    method: 'GET',
    path: '/police-forces',
    options: {
      notes: ['Gets full list of Police Forces that can be assigned to a CDO'],
      tags: ['api'],
      response: {
        schema: getPoliceForcesResponseSchema
      }
    },
    handler: async (request, h) => {
      const policeForceDaos = await getPoliceForces()
      const policeForces = policeForceDaos.map(mapPoliceForceDaoToDto)

      return h.response({
        policeForces
      }).code(200)
    }
  },
  {
    method: 'POST',
    path: '/police-forces',
    options: {
      auth: { scope: [scopes.admin] },
      tags: ['api'],
      notes: ['Create a new police force'],
      response: {
        status: {
          201: policeForceSchema,
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
        const { id, name } = await addForce(request.payload, getCallingUser(request))

        return h.response({
          id,
          name
        }).code(201)
      }
    }
  },
  {
    method: 'DELETE',
    path: '/police-forces/{policeForceId}',
    options: {
      auth: { scope: [scopes.admin] },
      tags: ['api'],
      response: {
        status: {
          404: notFoundSchema,
          204: undefined
        }
      },
      notes: ['Deletes police force with police force id']
    },
    handler: async (request, h) => {
      const policeForceId = request.params.policeForceId
      await deleteForce(policeForceId, getCallingUser(request))

      return h.response().code(204)
    }
  },
  {
    method: 'GET',
    path: '/police-force-by-short-name/{shortName}',
    options: {
      notes: ['Get a matching Police Force using the short_name'],
      tags: ['api'],
      response: {
        schema: getPoliceForceResponseSchema
      }
    },
    handler: async (request, h) => {
      const shortName = request.params.shortName
      const policeForce = mapPoliceForceDaoToDto(await getPoliceForceByShortName(shortName))

      return h.response({
        policeForce
      }).code(200)
    }
  }
]
