const authBasic = require('@hapi/basic')
const { validate } = require('../auth/token-validator')

module.exports = {
  plugin: {
    name: 'auth',
    register: async (server) => {
      await server.register(authBasic)

      server.auth.strategy('simple', 'basic', { validate })
      server.auth.default('simple')
    }
  }
}
