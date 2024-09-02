describe('token-validator', () => {
  describe('validate', () => {
    const token = 'abcdefgh123456'
    const hash = 'f206f17de6903f49950c041cfbafeed9'
    const request = {}

    jest.mock('../../../../app/proxy/auth-server')
    const { getUserInfo } = require('../../../../app/proxy/auth-server')

    jest.mock('../../../../app/session/hashCache', () => ({
      hashCache: new Map([
        ['cached.user@example.com', { hash, expiry: new Date(Date.now() + (30 * 60 * 1000)) }],
        ['expired.user@example.com', { hash, expiry: new Date(Date.now() - 1000) }]
      ])
    }))

    jest.mock('../../../../app/repos/user-accounts')
    const { isAccountEnabled } = require('../../../../app/repos/user-accounts')

    const { validate } = require('../../../../app/auth/token-validator')

    afterEach(() => {
      jest.resetAllMocks()
    })

    test('should successfully validate if user is registered', async () => {
      const username = 'registered@example.com'
      isAccountEnabled.mockResolvedValue(true)

      getUserInfo.mockResolvedValue({
        sub: 'blablablablablabla',
        email: username,
        email_verified: true,
        phone_number: '01406946277',
        phone_number_verified: true
      })
      const validation = await validate(request, 'registered@example.com', token)
      expect(validation).toEqual({
        isValid: true,
        credentials: {
          id: 'registered@example.com',
          user: 'registered@example.com'
        }
      })
    })

    test('should successfully validate if user is cached', async () => {
      const username = 'cached.user@example.com'

      getUserInfo.mockResolvedValue({
        sub: 'blablablablablabla',
        email: username,
        cachedUser: true,
        phone_number: '01406946277',
        phone_number_verified: true
      })

      const validation = await validate(request, username, token)
      expect(validation).toEqual({
        isValid: true,
        credentials: {
          id: 'cached.user@example.com',
          user: 'cached.user@example.com'
        }
      })
    })

    test('should not validate if user is not registered on DDI', async () => {
      const username = 'unauthorised.user@example.com'
      isAccountEnabled.mockResolvedValue(false)

      getUserInfo.mockResolvedValue({
        sub: 'blablablablablabla',
        email: username,
        email_verified: true,
        phone_number: '01406946277',
        phone_number_verified: true
      })

      const validation = await validate(request, username, token)
      expect(validation).toEqual({
        isValid: false,
        credentials: {
          id: null,
          user: null
        }
      })
    })

    test('should not validate if user was registered on DDI but has been removed and has expired cache', async () => {
      const username = 'expired.user@example.com'
      isAccountEnabled.mockResolvedValue(false)

      getUserInfo.mockResolvedValue({
        sub: 'blablablablablabla',
        email: username,
        email_verified: true,
        phone_number: '01406946277',
        phone_number_verified: true
      })

      const validation = await validate(request, username, token)
      expect(validation).toEqual({
        isValid: false,
        credentials: {
          id: null,
          user: null
        }
      })
    })

    test('should not validate if user fails external validation', async () => {
      const username = 'unauthorised.user@example.com'
      isAccountEnabled.mockResolvedValue(false)
      getUserInfo.mockRejectedValue(false)

      const validation = await validate(request, username, token)
      expect(validation).toEqual({
        isValid: false,
        credentials: {
          id: null,
          user: null
        }
      })
    })

    test('should not validate if a user is missing token', async () => {
      const validation = await validate({}, 'bob@builder.com', undefined)
      expect(validation).toEqual({ isValid: false, credentials: { id: null, user: null } })
    })

    test('should not validate if a user is missing username', async () => {
      const validation = await validate({}, undefined, 'ABCDEF')
      expect(validation).toEqual({ isValid: false, credentials: { id: null, user: null } })
    })
  })
})
