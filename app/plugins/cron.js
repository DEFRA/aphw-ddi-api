const HapiCron = require('hapi-cron')

module.exports = {
  plugin: HapiCron,
  options: {
    jobs: [{
      name: 'testcron',
      time: '* */5 * * * *',
      timezone: 'Europe/London',
      request: {
        method: 'GET',
        url: '/dog-breeds'
      },
      onComplete: (res) => {
        console.log('finished at ' + new Date())
        console.log(res.breeds[0].dataValues.breed) // 'hello world'
      }
    }]
  }
}
