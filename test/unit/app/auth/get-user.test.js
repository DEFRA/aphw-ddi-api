const { getCallingUser } = require('../../../../app/auth/get-user')
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
})
