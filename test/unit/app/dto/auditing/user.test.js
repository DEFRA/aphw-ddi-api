const { userValidateAudit, userInfoAudit, userLogoutAudit } = require('../../../../../app/dto/auditing/user')
const { devUser } = require('../../../../mocks/auth')

describe('UserAudit test', () => {
  const request = {
    auth: {
      artifacts: {
        decoded: {
          header: { alg: 'RS256', typ: 'JWT', kid: 'aphw-ddi-enforcement' },
          payload: {
            scopes: ['Dog.Index.Enforcement'],
            username: 'dev-user@test.com',
            displayname: 'Dev User',
            token: 'abcdef',
            iat: 1726587632,
            exp: 1726591232,
            aud: 'aphw-ddi-api',
            iss: 'aphw-ddi-enforcement'
          },
          signature: 'abcdef'
        }
      }
    }
  }

  describe('userInfoAudit', () => {
    test('should be a function', async () => {
      const res = await userInfoAudit(request)
      expect(res).toEqual(devUser)
    })
  })

  describe('userValidate', () => {
    test('should be a function', async () => {
      const res = await userValidateAudit(request)
      expect(res).toEqual(devUser)
    })
  })
  describe('userLogoutAudit', () => {
    test('should be a function', async () => {
      const res = await userLogoutAudit(request)
      expect(res).toEqual(devUser)
    })
  })
})
