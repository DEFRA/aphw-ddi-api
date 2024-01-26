const Joi = require('joi')

const schema = Joi.object({
  overnightJobCrontab: Joi.string()
})

const config = {
  overnightJobCrontab: process.env.OVERNIGHT_JOB_CRONTAB
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The crontab config is invalid. ${result.error.message}`)
}

console.log('Crontab entry is ', result.value.overnightJobCrontab)

module.exports = result.value
