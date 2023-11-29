const { getPoliceForces } = require('../repos/police-forces')

module.exports = {
  method: 'GET',
  path: '/police-forces',
  handler: async (request, h) => {
    const policeForces = await getPoliceForces()

    return h.response({
      policeForces
    }).code(200)
  }
}
