const { updateOvernightStatuses } = require('../repos/regular-jobs')

module.exports = {
  method: 'GET',
  path: '/overnight',
  handler: async (request, h) => {
    const res = await updateOvernightStatuses()

    return h.response({
      res
    }).code(200)
  }
}
