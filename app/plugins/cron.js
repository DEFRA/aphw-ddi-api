const HapiCron = require('hapi-cron')
const config = require('../config/cron')

module.exports = {
  plugin: HapiCron,
  options: {
    jobs: [{
      name: 'testcron',
      time: config.overnightJobCrontab ?? '5 4 * * *',
      timezone: 'Europe/London',
      request: {
        method: 'GET',
        url: '/overnight'
      },
      onComplete: (res) => {
        console.log('overnight finished at ' + new Date())
        console.log(`overnight result ${res}`)
      }
    }]
  }
}
