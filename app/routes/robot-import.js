const Joi = require('joi')
const { downloadBlob } = require('../storage')
const { importRegister, processRegister } = require('../import/robot')

module.exports = [{
  method: 'POST',
  path: '/robot-import',
  options: {
    validate: {
      headers: Joi.object({
        'content-type': Joi.string().valid('application/json').required()
      }).unknown(),
      payload: Joi.object({
        filename: Joi.string().required()
      }),
      failAction: (request, h, error) => {
        console.error(error)
        return h.response().code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const blob = await downloadBlob('inbound', request.payload.filename)
      const register = await importRegister(blob)

      console.log('Import validation completed. Error count = ', register.errors?.length ?? 0)

      if (register.errors?.length > 0) {
        return h.response(register.errors).code(400)
      }

      console.log('Import insert starting')
      await processRegister(register)
      console.log('Import finished')

      return h.response(register.errors).code(200)
    }
  }
}]
