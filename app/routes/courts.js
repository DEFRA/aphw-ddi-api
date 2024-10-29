const { getCourts, createCourt, deleteCourt } = require('../repos/courts')
const { getCallingUser } = require('../auth/get-user')
const { createAdminItem } = require('../schema/admin/create')
const { courtsResponseSchema, createCourtResponseSchema } = require('../schema/courts')
const { conflictSchema } = require('../schema/common/response/conflict')
const { notFoundSchema } = require('../schema/common/response/not-found')
const { mapCourtToDto } = require('../dto/courts')
const { scopes } = require('../constants/auth')

module.exports = [
  {
    method: 'GET',
    path: '/courts',
    options: {
      tags: ['api'],
      notes: ['Returns the full list of courts on the DB with their ids'],
      response: {
        schema: courtsResponseSchema
      }
    },
    handler: async (request, h) => {
      const courtDaos = await getCourts()

      const courts = courtDaos.map(mapCourtToDto)
      return h.response({
        courts
      }).code(200)
    }
  },
  {
    method: 'POST',
    path: '/courts',
    options: {
      auth: { scope: [scopes.admin] },
      tags: ['api'],
      notes: ['Creates a new court'],
      response: {
        status: {
          201: createCourtResponseSchema,
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
        const court = await createCourt(request.payload, getCallingUser(request))

        return h.response({
          id: court.id,
          name: court.name
        }).code(201)
      }
    }
  },
  {
    method: 'DELETE',
    path: '/courts/{courtId}',
    options: {
      tags: ['api'],
      notes: ['Soft deletes a court from the DB'],
      response: {
        status: {
          204: undefined,
          404: notFoundSchema
        }
      }
    },
    handler: async (request, h) => {
      const courtId = request.params.courtId
      await deleteCourt(courtId, getCallingUser(request))

      return h.response().code(204)
    }
  }
]
