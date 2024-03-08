const Joi = require('joi')

const personsFilter = Joi.object({
  firstName: Joi.string().optional().allow('').allow(null),
  lastName: Joi.string().optional().allow('').allow(null),
  dateOfBirth: Joi.date().iso().allow(null).optional()
})

module.exports = {
  personsFilter
}
