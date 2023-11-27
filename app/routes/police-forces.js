const { getForces } = require('../repos/police-forces')

module.exports = {
  method: 'GET',
  path: '/police-forces',
  handler: async (request, h) => {
    const forces = await getForces()

    return h.response({
      forces: forces.map(force => force.name)
    }).code(200)
  }
}
