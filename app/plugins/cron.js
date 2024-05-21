const cron = require('node-cron')
const config = require('../config/cron')
const { runOvernightJobs } = require('../overnight/run-jobs')

const setupCron = (server) => {
  cron.schedule(config.overnightJobCrontab ?? '5 4 * * *', async () => {
    const result = await runOvernightJobs(server)
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
