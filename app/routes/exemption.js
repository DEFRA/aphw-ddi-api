const { updateExemption } = require('../repos/exemption')
const { exemption: updateExemptionSchema } = require('../schema/cdo/update')

module.exports = [{
  method: 'PUT',
  path: '/exemption',
  options: {
    validate: {
      payload: updateExemptionSchema,
      failAction: (request, h, err) => {
        console.error(err)

        return h.response().code(400).takeover()
      }
    },
    handler: async (request, h) => {
      await updateExemption(request.payload)

      return h.response().code(200)
    }
  }
}]
