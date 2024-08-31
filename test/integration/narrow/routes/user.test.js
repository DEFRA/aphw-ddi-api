const { authHeaders, mockValidate } = require('../../../mocks/auth')

describe('User endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')

  jest.mock('../../../../app/session/hashCache', () => ({
    hashCache: new Map()
  }))
  const { hashCache } = require('../../../../app/session/hashCache')

  beforeEach(async () => {
    jest.clearAllMocks()
    validate.mockResolvedValue(mockValidate)
    server = await createServer()
    await server.initialize()
  })

  describe('GET /user/me/validate', () => {
    test('should validate and return a 204 if user is registered', async () => {
      const options = {
        method: 'GET',
        url: '/user/me/validate',
        ...authHeaders
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(204)
    })

    test('should not validate and return a 401 if user is not registered', async () => {
      validate.mockResolvedValue({
        ...mockValidate,
        isValid: false
      })

      const options = {
        method: 'GET',
        url: '/user/me/validate',
        ...authHeaders
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(401)
    })
  })

  describe('DELETE /user/me/cache', () => {
    test('DELETE /user/me/cache route returns 204', async () => {
      hashCache.set('dev-user@test.com', 'ABCDEFG12345')

      const options = {
        method: 'DELETE',
        url: '/user/me/cache',
        ...authHeaders
      }

      expect(hashCache.has('dev-user@test.com')).toBe(true)

      const response = await server.inject(options)
      expect(response.statusCode).toBe(204)
      expect(hashCache.has('dev-user@test.com')).toBe(false)
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
