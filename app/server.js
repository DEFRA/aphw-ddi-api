const Hapi = require('@hapi/hapi')
const Graphi = require('graphi')
const schema = require('./graphql/registration-schema')

async function createServer () {
  const server = Hapi.server({
    port: process.env.PORT,
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

  return server
}

module.exports = createServer
