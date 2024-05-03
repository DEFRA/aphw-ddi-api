const { getCourts, createCourt, deleteCourt } = require('../repos/courts')
const { getCallingUser } = require('../auth/get-user')
const { createAdminItem } = require('../schema/admin/create')

module.exports = [
  {
    method: 'GET',
    path: '/courts',
    handler: async (request, h) => {
      const courts = await getCourts()

      return h.response({
        courts
      }).code(200)
    }
  },
  {
    method: 'POST',
    path: '/courts',
    options: {
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
    handler: async (request, h) => {
      const courtId = request.params.courtId
      await deleteCourt(courtId, getCallingUser(request))

      return h.response().code(204)
    }
  }
]
