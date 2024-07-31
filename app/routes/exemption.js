const { getCallingUser } = require('../auth/get-user')
const { updateExemption } = require('../repos/exemption')
const { validatePayload, fullExemptionPayloadSchema, exemptionResponseSchema } = require('../schema/exemption/update')
const { mapExemptionDaoToDto } = require('../dto/exemption')

module.exports = [{
  method: 'PUT',
  path: '/exemption',
  options: {
    tags: ['api'],
    validate: {
      payload: fullExemptionPayloadSchema
    },
    response: {
      status: {
        400: undefined,
        200: exemptionResponseSchema
      }
    },
    notes: ['Updates exemption details on a specific dog index number'],
    handler: async (request, h) => {
      try {
        await validatePayload(request.payload)
      } catch (err) {
        console.error(err)
        return h.response().code(400).takeover()
      }

      const res = await updateExemption(request.payload, getCallingUser(request))
      const dto = mapExemptionDaoToDto(res)

      return h.response(dto).code(200)
    }
  }
}]
