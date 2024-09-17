const { getCallingUser } = require('../../../../app/auth/get-user')
describe('get-user', () => {
  describe('getCallingUser', () => {
    const request = {
      headers: {
        'ddi-username': 'dev-user@example.com',
        'ddi-displayname': 'Dev User'
      }
    }

    test('should get calling user if headers exist', () => {
      const result = getCallingUser(request)

      expect(result).toEqual({
        username: 'dev-user@example.com',
        displayname: 'Dev User'
      })
    })

    test('should return no user if request is missing', () => {
      const result = getCallingUser(undefined)

      expect(result).toEqual({
        username: '',
        displayname: ''
      })
    })

    test('should return no user if request headers is missing', () => {
      const result = getCallingUser({})

      expect(result).toEqual({
        username: '',
        displayname: ''
      })
    })
  })
})
