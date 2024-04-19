const Joi = require('joi')

const createCourtSchema = Joi.object({
  name: Joi.string().required()
}).required()

module.exports = {
  createCourtSchema
}
