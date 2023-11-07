const Joi = require('joi')

const schema = Joi.object({
  people: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      address: Joi.object({
        address_line_1: Joi.string().required(),
        address_line_2: Joi.string().allow(null).allow('').optional(),
        address_line_3: Joi.string().allow(null).allow('').optional(),
        postcode: Joi.string().required(),
        county: Joi.string().required(),
        country: Joi.string().required()
      }).required(),
      contacts: Joi.array().items(
        Joi.object({
          type: Joi.string().required(),
          contact: Joi.string().required()
        }).required()
      ).optional()
    }))
}).required()

module.exports = schema
