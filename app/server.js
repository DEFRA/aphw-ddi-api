const Hapi = require('@hapi/hapi')
const config = require('./config')
const { setupCron } = require('./plugins/cron')

async function createServer () {
  const server = Hapi.server({
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  await server.register(require('./plugins/open-api'))
  await server.register(require('./plugins/router'))

  setupCron()

  return server
}

module.exports = createServer
