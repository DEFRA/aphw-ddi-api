const cron = require('node-cron')
const config = require('../config/cron')
const { runOvernightJobs } = require('../overnight/run-jobs')
const { purgeExpiredCache } = require('../auth/purge-expired-cache')

const setupCron = (server) => {
  cron.schedule(config.overnightJobCrontab ?? '5 4 * * *', async () => {
    const result = await runOvernightJobs(server)
    console.log('overnight finished at ' + new Date())
    console.log(`overnight result ${result}`)
  }, {
    scheduled: true,
    timezone: 'Europe/London'
  })

  cron.schedule(config.purgeExpiredCacheCrontab ?? '0 */2 * * *', async () => {
    const result = purgeExpiredCache()
    console.log('hourly cron finished at ' + new Date())
    console.log(`hourly cron result ${result}`)
  }, {
    scheduled: true,
    timezone: 'Europe/London'
  })
}

module.exports = {
  setupCron
}
