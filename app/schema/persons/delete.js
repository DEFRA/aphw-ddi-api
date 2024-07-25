const Joi = require('joi')

const deletePayloadSchema = Joi.object({
  personReferences: Joi.array().items(Joi.string()).min(1).required()
}).required()

module.exports = {
  deletePayloadSchema
}
