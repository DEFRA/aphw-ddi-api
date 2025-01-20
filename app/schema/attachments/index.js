const Joi = require('joi')

const testAttachmentRequestSchema = Joi.object({
  fileInfo: Joi.object({
    filename: Joi.string().required(),
    fileGuid: Joi.string().allow('').allow(null).optional(),
    flattenPdf: Joi.boolean().default(false),
    saveFile: Joi.boolean().default(false)
  }),
  fieldData: Joi.object({
    ddi_index_number: Joi.string().required(),
    ddi_dog_name: Joi.string().optional().allow('').allow(null),
    ddi_owner_name: Joi.string().optional().allow('').allow(null),
    ddi_address_line_1: Joi.string().optional().allow('').allow(null),
    ddi_address_line_2: Joi.string().optional().allow('').allow(null),
    ddi_town: Joi.string().optional().allow('').allow(null),
    ddi_postcode: Joi.string().optional().allow('').allow(null),
    ddi_todays_date: Joi.string().optional().allow('').allow(null),
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
