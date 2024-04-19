const { getCourts, createCourt, deleteCourt } = require('../repos/courts')
const { getCallingUser } = require('../auth/get-user')

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
    handler: async (request, h) => {
      const court = await createCourt(request.payload, getCallingUser(request))

      return h.response({
        id: court.id,
        name: court.name
      }).code(201)
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
