const Joi = require('joi')

const deleteDogsPayloadSchema = Joi.object({
  dogPks: Joi.array().items(Joi.string()).min(1).required()
}).required()

module.exports = {
  deleteDogsPayloadSchema
}
