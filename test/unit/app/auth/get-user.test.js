const { getCallingUser } = require('../../../../app/auth/get-user')
describe('get-user', () => {
  describe('getCallingUser', () => {
    const request = {
      headers: {
        'ddi-username': 'dev-user@example.com',
        'ddi-displayname': 'Dev User'
      },
      auth: {
        credentials: {
          user: 'dev-user@example.com',
          displayname: 'Dev User'
        }
      }
    }

    test('should get calling user if headers exist', () => {
      const result = getCallingUser(request)

      expect(result).toEqual({
        username: 'dev-user@example.com',
        displayname: 'Dev User'
      })
    })

    test('should get calling user if only headers exist', () => {
      const { auth: _auth, ...requestHeaders } = request
      const result = getCallingUser(requestHeaders)

      expect(result).toEqual({
        username: 'dev-user@example.com',
        displayname: 'Dev User'
      })
    })

    test('should get calling user if headers exist, but credentials are missing', () => {
      const result = getCallingUser({
        ...request,
        auth: {}
      })

      expect(result).toEqual({
        username: 'dev-user@example.com',
        displayname: 'Dev User'
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
})
