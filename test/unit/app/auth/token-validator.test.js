describe('token-validator', () => {
  describe('validate', () => {
    const token = 'abcdefgh123456'
    const hash = 'd6cc9248e1b00a34bd2ef25a05ebcfe74acee6f1b6aedaf1745bcc22c79b08bf837b00985d2480555e67daf6ad9d2354d297f34aeb3d9e1322cbeedace794059'

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

    test('should not validate if a user is missing token', async () => {
      const validation = await validate({ decoded: { payload: { username: 'bob@builder.com' } } })
      expect(validation).toEqual({ isValid: false, credentials: { id: null, user: null, displayname: null, scopes: [] } })
    })

    describe('aphw-ddi-portal', () => {
      test('should successfully validate with aphw-ddi-portal call', async () => {
        const artifacts = {
          decoded: {
            payload: {
              username: 'william.shakespeare@theglobe.co.uk',
              displayname: 'William Shakespeare',
              exp: expect.any(Number),
              iat: expect.any(Number),
              scopes: ['abc'],
              iss: 'aphw-ddi-portal'
            }
          }
        }

        const value = await validate(artifacts)

        expect(value).toEqual({
          isValid: true,
          credentials: {
            id: 'william.shakespeare@theglobe.co.uk',
            user: 'william.shakespeare@theglobe.co.uk',
            displayname: 'William Shakespeare',
            scopes: ['abc']
          }
        })
      })

      test('should fail validation if no username exists', async () => {
        const artifacts = {
          decoded: {
            payload: {
              exp: expect.any(Number),
              iat: expect.any(Number),
              scopes: ['abc'],
              iss: 'aphw-ddi-portal'
            }
          }
        }

        const value = await validate(artifacts)

        expect(value).toEqual({
          isValid: false,
          credentials: {
            id: null,
            user: null,
            displayname: null,
            scopes: []
          }
        })
      })
    })

    describe('aphw-ddi-enforcement', () => {
      const username = 'chuck@norris.org'
      const artifacts = {
        decoded: {
          payload: {
            username,
            displayname: username,
            exp: expect.any(Number),
            iat: expect.any(Number),
            token,
            scopes: ['abc'],
            iss: 'aphw-ddi-enforcement'
          }
        }
      }

      const makeArtifacts = (username) => ({
        decoded: {
          payload: {
            ...artifacts.decoded.payload,
            username,
            displayname: username
          }
        }
      })

      test('should successfully validate with aphw-ddi-enforcement call if user is registered', async () => {
        isAccountEnabled.mockResolvedValue(true)

        getUserInfo.mockResolvedValue({
          sub: 'blablablablablabla',
          email: username,
          email_verified: true,
          phone_number: '01406946277',
          phone_number_verified: true
        })

        const validation = await validate(artifacts)
        expect(validation).toEqual({
          isValid: true,
          credentials: {
            id: 'chuck@norris.org',
            user: 'chuck@norris.org',
            displayname: 'chuck@norris.org',
            scopes: ['abc']
          }
        })
      })

      test('should successfully validate if user is cached', async () => {
        const username = 'cached.user@example.com'
        const artifacts = makeArtifacts(username)

        getUserInfo.mockResolvedValue({
          sub: 'blablablablablabla',
          email: username,
          cachedUser: true,
          phone_number: '01406946277',
          phone_number_verified: true
        })

        const validation = await validate(artifacts)

        expect(validation).toEqual({
          isValid: true,
          credentials: {
            id: 'cached.user@example.com',
            displayname: 'cached.user@example.com',
            user: 'cached.user@example.com',
            scopes: ['abc']
          }
        })
      })

      test('should not validate if token is missing', async () => {
        const username = 'unauthorised.user@example.com'
        const artifacts = makeArtifacts(username)
        artifacts.decoded.payload.token = null
        isAccountEnabled.mockResolvedValue(true)

        getUserInfo.mockResolvedValue({
          sub: 'blablablablablabla',
          email: username,
          email_verified: true,
          phone_number: '01406946277',
          phone_number_verified: true
        })

        const validation = await validate(artifacts)

        expect(validation).toEqual({
          isValid: false,
          credentials: {
            displayname: null,
            id: null,
            scopes: [],
            user: null
          }
        })
      })

      test('should not validate if user is not registered on DDI', async () => {
        const username = 'unauthorised.user@example.com'
        const artifacts = makeArtifacts(username)
        isAccountEnabled.mockResolvedValue(false)

        getUserInfo.mockResolvedValue({
          sub: 'blablablablablabla',
          email: username,
          email_verified: true,
          phone_number: '01406946277',
          phone_number_verified: true
        })

        const validation = await validate(artifacts)

        expect(validation).toEqual({
          isValid: false,
          credentials: {
            displayname: null,
            id: null,
            scopes: [],
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

        const artifacts = makeArtifacts(username)
        const validation = await validate(artifacts)

        expect(validation).toEqual({
          isValid: false,
          credentials: {
            displayname: null,
            id: null,
            scopes: [],
            user: null
          }
        })
      })

      test('should not validate if user fails external validation', async () => {
        const username = 'unauthorised.user@example.com'
        isAccountEnabled.mockResolvedValue(false)
        getUserInfo.mockRejectedValue(false)

        const artifacts = makeArtifacts(username)
        const validation = await validate(artifacts)
        expect(validation).toEqual({
          isValid: false,
          credentials: {
            displayname: null,
            id: null,
            scopes: [],
            user: null
          }
        })
      })

      test('should not validate if user has not activated their email on external provider', async () => {
        const username = 'unactivated.user@example.com'
        isAccountEnabled.mockResolvedValue(true)

        getUserInfo.mockResolvedValue({
          sub: 'blablablablablabla',
          email: username,
          email_verified: false,
          phone_number: '01406946277',
          phone_number_verified: true
        })

        const artifacts = makeArtifacts(username)
        const validation = await validate(artifacts)
        expect(validation).toEqual({
          isValid: false,
          credentials: {
            displayname: null,
            id: null,
            scopes: [],
            user: null
          }
        })
      })

      test('should not validate if a user is missing username', async () => {
        const invalidArtifacts = {
          decoded: {
            payload: {
              exp: expect.any(Number),
              iat: expect.any(Number),
              token,
              scopes: ['abc'],
              iss: 'aphw-ddi-enforcement'
            }
          }
        }
        const validation = await validate(invalidArtifacts, {}, undefined, 'ABCDEF')
        expect(validation).toEqual({ isValid: false, credentials: { id: null, user: null, displayname: null, scopes: [] } })
      })
    })
  })
})
