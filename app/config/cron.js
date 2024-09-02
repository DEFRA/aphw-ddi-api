const Joi = require('joi')

const schema = Joi.object({
  overnightJobCrontab: Joi.string(),
  purgeExpiredCacheCrontab: Joi.string()
})

const config = {
  overnightJobCrontab: process.env.OVERNIGHT_JOB_CRONTAB,
  purgeExpiredCacheCrontab: process.env.PURGE_EXPIRED_CACHE_CRONTAB
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The crontab config is invalid. ${result.error.message}`)
}

console.log('Crontab entry is ', result.value.overnightJobCrontab)
console.log('Purge Expired Cache Crontab entry is ', result.value.purgeExpiredCacheCrontab)

module.exports = result.value
