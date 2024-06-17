const Joi = require('joi')

const purgeSoftDelete = Joi.object({
  today: Joi.date().optional().default(new Date())
})

module.exports = {
  purgeSoftDelete
}
