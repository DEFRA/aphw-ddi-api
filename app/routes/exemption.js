const { getCallingUser } = require('../auth/get-user')
const { updateExemption } = require('../repos/exemption')
const { validatePayload } = require('../schema/exemption/update')

module.exports = [{
  method: 'PUT',
  path: '/exemption',
  options: {
    tags: ['api'],
    handler: async (request, h) => {
      try {
        await validatePayload(request.payload)
      } catch (err) {
        console.error(err)
        return h.response().code(400).takeover()
      }

      const res = await updateExemption(request.payload, getCallingUser(request))

      return h.response(res).code(200)
    }
  }
}]
