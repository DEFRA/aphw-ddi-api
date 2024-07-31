const { getPoliceForces, addForce, deleteForce } = require('../repos/police-forces')
const { createAdminItem } = require('../schema/admin/create')
const { getCallingUser } = require('../auth/get-user')
const { getPoliceForcesResponseSchema } = require('../schema/police-forces')
const { mapPoliceForceDaoToDto } = require('../dto/police-force')

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
      tags: ['api'],
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
    options: { tags: ['api'] },
    handler: async (request, h) => {
      const policeForceId = request.params.policeForceId
      await deleteForce(policeForceId, getCallingUser(request))

      return h.response().code(204)
    }
  }
]
