const cron = require('node-cron')
const config = require('../config/cron')
const { runOvernightJobs } = require('../repos/regular-jobs')

const setupCron = () => {
  cron.schedule(config.overnightJobCrontab ?? '*/10 * * * *', async () => {
    const result = await runOvernightJobs()
    console.log('overnight finished at ' + new Date())
    console.log(`overnight result ${result}`)
  }, {
    scheduled: true,
    timezone: 'Europe/London'
  })
}

module.exports = {
  setupCron
}
