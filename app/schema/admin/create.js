const Joi = require('joi')

const createAdminItem = Joi.object({
  name: Joi.string().required()
}).required()

module.exports = {
  createAdminItem
}
