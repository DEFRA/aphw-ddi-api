const { updateExemption } = require('../repos/exemption')
const { exemption: updateExemptionSchema } = require('../schema/exemption/update')

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
      const res = await updateExemption(request.payload)

      return h.response(res).code(200)
    }
  }
}]
