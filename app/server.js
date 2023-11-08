const storage = require('./storage')
const Hapi = require('@hapi/hapi')
const Graphi = require('graphi')
const schema = require('./graphql/registration-schema')
const config = require('./config')

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

  await server.register(require('./plugins/router'))
  await server.register({ plugin: Graphi, options: { name: 'grahql', schema } })

  // A dummy call to ensure the necessary folder structure is created
  await storage.getInboundFileList()

  return server
}

module.exports = createServer
