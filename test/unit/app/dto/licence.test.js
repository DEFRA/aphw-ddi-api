jest.mock('../../../../app/repos/user-accounts')
const { verifyLicenceAccepted, setLicenceAcceptedDate } = require('../../../../app/repos/user-accounts')

const { userVerifyLicenceAccepted, userSetLicenceAccepted } = require('../../../../app/dto/licence')

describe('Licence test', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    verifyLicenceAccepted.mockResolvedValue(true)
    setLicenceAcceptedDate.mockResolvedValue(true)
  })

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

  describe('userVerifyLicenceAccepted', () => {
    test('should extract username', async () => {
      const res = await userVerifyLicenceAccepted(request)
      expect(res).toBeTruthy()
      expect(verifyLicenceAccepted).toHaveBeenCalledWith('dev-user@test.com')
    })

    test('should return false if cannot extract username', async () => {
      const res = await userVerifyLicenceAccepted({ auth: null })
      expect(res).toBeFalsy()
      expect(verifyLicenceAccepted).not.toHaveBeenCalled()
    })
  })

  describe('userSetLicenceAccepted', () => {
    test('should extract username', async () => {
      const res = await userSetLicenceAccepted(request)
      expect(res).toBeTruthy()
      expect(setLicenceAcceptedDate).toHaveBeenCalledWith('dev-user@test.com')
    })

    test('should return false if cannot extract username', async () => {
      const res = await userSetLicenceAccepted({ auth: null })
      expect(res).toBeFalsy()
      expect(setLicenceAcceptedDate).not.toHaveBeenCalled()
    })
  })
})
