const Joi = require('joi')

const testAttachmentRequestSchema = Joi.object({
  fileInfo: Joi.object({
    filename: Joi.string().required(),
    fileGuid: Joi.string().allow('').allow(null).optional(),
    saveFile: Joi.boolean().default(false)
  }),
  fieldData: Joi.object({
    ddi_index_number: Joi.string().required(),
    submitButton: Joi.string().allow('').allow(null).strip()
  })
}).required()

const testAttachmentResponseSchema = Joi.object({
  status: Joi.string(),
  message: Joi.string(),
  filename: Joi.string()
})

module.exports = {
  testAttachmentRequestSchema,
  testAttachmentResponseSchema
}
