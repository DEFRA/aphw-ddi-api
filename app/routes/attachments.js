const { testAttachmentResponseSchema, testAttachmentRequestSchema } = require('../schema/attachments')
const { scopes } = require('../constants/auth')
const { populateTemplate } = require('../proxy/documents')

module.exports = [
  {
    method: 'POST',
    path: '/attachments/test',
    options: {
      auth: { scope: [scopes.admin] },
      tags: ['api'],
      notes: ['Tests a template for email attachments by populating with data'],
      response: {
        status: {
          201: testAttachmentResponseSchema
        }
      },
      validate: {
        payload: testAttachmentRequestSchema,
        failAction: (_request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        // const options = { payload: request.payload }
        // await populateTemplate(options)

        return h.response({
          status: 'ok',
          message: 'output generated'
        }).code(200)
      }
    }
  }
]
