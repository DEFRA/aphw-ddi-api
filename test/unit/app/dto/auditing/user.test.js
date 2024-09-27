const { devUser } = require('../../../../mocks/auth')
const { USER_ACCOUNT } = require('../../../../../app/constants/event/audit-event-object-types')

const dummyAdminUser = {
  username: 'dummy-user',
  displayname: 'Dummy User'
}

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

  jest.mock('../../../../../app/messaging/send-audit')
  const { sendCreateToAudit, sendDeleteToAudit } = require('../../../../../app/messaging/send-audit')

  const { userValidateAudit, userInfoAudit, userLogoutAudit, createUserAccountAudit, deleteUserAccountAudit } = require('../../../../../app/dto/auditing/user')

  describe('createUserAccountAudit', () => {
    test('should publish audit record on creation of new user', async () => {
      const account = {
        id: 1,
        username: 'bob@example.com',
        police_force_id: 2
      }
      await createUserAccountAudit(account, dummyAdminUser)
      expect(sendCreateToAudit).toHaveBeenCalledWith(USER_ACCOUNT, account, dummyAdminUser)
    })
  })

  describe('deleteUserAccountAudit', () => {
    test('should publish audit record on deletion of new user', async () => {
      const account = {
        id: 1,
        username: 'bob@example.com',
        police_force_id: 2
      }
      await deleteUserAccountAudit(account, dummyAdminUser)

      expect(sendDeleteToAudit).toHaveBeenCalledWith(USER_ACCOUNT, account, dummyAdminUser)
    })
  })

  describe('userInfoAudit', () => {
    test('should be a function', async () => {
      const res = await userInfoAudit(request)
      expect(res).toEqual(devUser)
    })

    test('should work if no token exists', async () => {
      const res = await userInfoAudit({})
      expect(res).toEqual({ username: null, displayname: null })
    })
  })

  describe('userValidate', () => {
    test('should be a function', async () => {
      const res = await userValidateAudit(request)
      expect(res).toEqual(devUser)
    })
    test('should work if no token exists', async () => {
      const res = await userValidateAudit({ })
      expect(res).toEqual({ username: null, displayname: null })
    })
  })
  describe('userLogoutAudit', () => {
    test('should be a function', async () => {
      const res = await userLogoutAudit(request)
      expect(res).toEqual(devUser)
    })
    test('should work if no token exists', async () => {
      const res = await userLogoutAudit({ })
      expect(res).toEqual({ username: null, displayname: null })
    })
  })
})
