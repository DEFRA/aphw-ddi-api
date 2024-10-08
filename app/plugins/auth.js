const Jwt = require('@hapi/jwt')
const { validate } = require('../auth/token-validator')
const { issuers } = require('../constants/auth')
const config = require('../config')

module.exports = {
  plugin: {
    name: 'auth',
    register: async (server) => {
      await server.register(Jwt)

      server.auth.strategy('api_jwt', 'jwt', {
        keys: [
          {
            key: atob(config.authTokens.portalKey),
            kid: issuers.portal,
            algorithms: ['RS256']
          },
          {
            key: atob(config.authTokens.enforcementKey),
            kid: issuers.enforcement,
            algorithms: ['RS256']
          },
          {
            key: atob(config.authTokens.apiKeyPublicKey),
            kid: issuers.api,
            algorithms: ['RS256']
          }
        ],
        verify: {
          aud: 'aphw-ddi-api',
          iss: [issuers.portal, issuers.enforcement, issuers.api],
          sub: false
        },
        validate
      })
      server.auth.default('api_jwt')
    }
  }
}
