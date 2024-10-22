const Hapi = require('@hapi/hapi')
const config = require('./config')
const { setupCron } = require('./plugins/cron')

async function createServer () {
  const server = Hapi.server({
    port: config.port,
    cache: [{
      name: config.cacheConfig.cacheName,
      provider: {
        constructor: config.cacheConfig.catbox,
        options: config.cacheConfig.catboxOptions
      }
    }],
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

  server.app.cache = server.cache({ cache: config.cacheConfig.cacheName, segment: config.cacheConfig.segment, expiresIn: config.cacheConfig.ttl })

  await server.register(require('./plugins/open-api'))
  await server.register(require('./plugins/auth'))
  await server.register(require('./plugins/router'))

  setupCron(server)

  return server
}

module.exports = createServer
