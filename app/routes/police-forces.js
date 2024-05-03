const { getPoliceForces, addForce } = require('../repos/police-forces')
const { createAdminItem } = require('../schema/admin/create')
const { createCourt } = require('../repos/courts')
const { getCallingUser } = require('../auth/get-user')

module.exports = [
  {
    method: 'GET',
    path: '/police-forces',
    handler: async (request, h) => {
      const policeForces = await getPoliceForces()

      return h.response({
        policeForces
      }).code(200)
    }
  },
  {
    method: 'POST',
    path: '/police-forces',
    options: {
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
  }
]
