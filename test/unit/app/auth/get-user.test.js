const { getCallingUser, getCallingUsername, getUserOrigin } = require('../../../../app/auth/get-user')
describe('get-user', () => {
  describe('getCallingUser', () => {
    const request = {
      auth: {
        credentials: {
          user: 'dev-user@example.com',
          displayname: 'Dev User'
        }
      }
    }

    test('should get calling user if credentials exist', () => {
      const result = getCallingUser(request)

      expect(result).toEqual({
        username: 'dev-user@example.com',
        displayname: 'Dev User'
      })
    })

    test('should return no user if credentials are missing', () => {
      const result = getCallingUser({
        auth: {}
      })

      expect(result).toEqual({
        username: '',
        displayname: ''
      })
    })

    test('should return no user if request and JWT credentials are undefined', () => {
      const result = getCallingUser(undefined)

      expect(result).toEqual({
        username: '',
        displayname: ''
      })
    })

    test('should return no user if request headers and JWT credentials are missing', () => {
      const result = getCallingUser({})

      expect(result).toEqual({
        username: '',
        displayname: ''
      })
    })
  })

  describe('getCallingUsername', () => {
    test('should get username if one exists', () => {
      const request = {
        auth: {
          credentials: {
            user: 'dev-user@test.com',
            displayname: 'dev-user@test.com'
          }
        }
      }
      expect(getCallingUsername(request)).toBe('dev-user@test.com')
    })

    test('should return null if no username exists', () => {
      const request = {
        auth: {
          credentials: {}
        }
      }
      expect(getCallingUsername(request)).toBe(null)
    })
  })

  describe('getUserOrigin', () => {
    const request = {
      auth: {
        artifacts: {
          decoded: {
            header: { alg: 'RS256', typ: 'JWT', kid: 'aphw-ddi-enforcement' },
            payload: {
              iss: 'aphw-ddi-enforcement'
            },
            signature: 'abcdef'
          }
        },
        credentials: {
          user: 'dev-user@test.com',
          displayname: 'Dev User'
        }
      },
      headers: {
        'ddi-username': 'dev-user@test.com',
        'ddi-displayname': 'Dev User'
      }
    }
    test('should get issuer', () => {
      const issuer = getUserOrigin(request)
      expect(issuer).toBe('aphw-ddi-enforcement')
    })

    test('should return null if does not exist', () => {
      const issuer = getUserOrigin({ auth: { artifacts: {} } })
      expect(issuer).toBe(null)
    })
  })
})
