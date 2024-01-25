const { updateOvernightStatuses } = require('../repos/regular-jobs')

module.exports = {
  method: 'GET',
  path: '/overnight',
  handler: async (request, h) => {
    const result = await updateOvernightStatuses()

    return h.response({
      result
    }).code(200)
  }
}
