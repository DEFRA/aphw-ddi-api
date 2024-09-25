const { mockValidate } = require('../../../mocks/auth')
const { portalHeader } = require('../../../mocks/jwt')

describe('User endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')

  jest.mock('../../../../app/service/config')
  const { getRegistrationService } = require('../../../../app/service/config')

  jest.mock('../../../../app/session/hashCache', () => ({
    hashCache: new Map()
  }))
  const { hashCache } = require('../../../../app/session/hashCache')

  beforeEach(async () => {
    jest.clearAllMocks()
    validate.mockResolvedValue(mockValidate)
    getRegistrationService.mockReturnValue({
      isUserLicenceAccepted: jest.fn(),
      setUserLicenceAccepted: jest.fn(),
      isUserEmailVerified: jest.fn(),
      sendVerifyEmail: jest.fn(),
      verifyEmailCode: jest.fn()
    })
    server = await createServer()
    await server.initialize()
  })

  describe('GET /user/me/validate', () => {
    test('should validate and return a 204 if user is registered', async () => {
      const options = {
        method: 'GET',
        url: '/user/me/validate',
        ...portalHeader
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
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(401)
    })
  })

  describe('GET /user/me/licence', () => {
    test('should validate and return a 200 true if user accepted licence', async () => {
      getRegistrationService().isUserLicenceAccepted.mockResolvedValue(true)
      const options = {
        method: 'GET',
        url: '/user/me/licence',
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.payload).toBe('true')
    })

    test('should validate and return a 200 false if user not accepted licence', async () => {
      getRegistrationService().isUserLicenceAccepted.mockResolvedValue(false)
      const options = {
        method: 'GET',
        url: '/user/me/licence',
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.payload).toBe('false')
    })
  })

  describe('PUT /user/me/licence', () => {
    test('should return a 200 if user accepted licence', async () => {
      getRegistrationService().setUserLicenceAccepted.mockResolvedValue(true)
      const options = {
        method: 'PUT',
        url: '/user/me/licence',
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('should return a 500 if user not accepted licence', async () => {
      getRegistrationService().setUserLicenceAccepted.mockResolvedValue(false)
      const options = {
        method: 'PUT',
        url: '/user/me/licence',
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  describe('GET /user/me/email', () => {
    test('should validate and return a 200 true if user accepted licence', async () => {
      getRegistrationService().isUserEmailVerified.mockResolvedValue(true)
      const options = {
        method: 'GET',
        url: '/user/me/email',
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.payload).toBe('true')
    })

    test('should validate and return a 200 false if user not accepted licence', async () => {
      getRegistrationService().isUserEmailVerified.mockResolvedValue(false)
      const options = {
        method: 'GET',
        url: '/user/me/email',
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.payload).toBe('false')
    })
  })

  describe('PUT /user/me/email', () => {
    test('should validate and return a 200 true if email sent', async () => {
      getRegistrationService().sendVerifyEmail.mockResolvedValue(true)
      const options = {
        method: 'PUT',
        url: '/user/me/email',
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.payload).toBe('true')
    })

    test('should validate and return a 500 if error', async () => {
      getRegistrationService().sendVerifyEmail.mockImplementation(() => { throw new Error('Unable to send') })
      const options = {
        method: 'PUT',
        url: '/user/me/email',
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
      expect(response.payload).toContain('An internal server error occurred')
    })
  })

  describe('POST /user/me/email', () => {
    test('should validate OTP code return a 200 with result of ok if code is correct', async () => {
      getRegistrationService().verifyEmailCode.mockResolvedValue('Ok')
      const options = {
        method: 'POST',
        url: '/user/me/email',
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.payload).toContain('Ok')
    })

    test('should validate and return a 200 with error message', async () => {
      getRegistrationService().verifyEmailCode.mockResolvedValue('Invalid code')
      const options = {
        method: 'POST',
        url: '/user/me/email',
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.payload).toContain('Invalid code')
    })
  })

  describe('DELETE /user/me/cache', () => {
    test('DELETE /user/me/cache route returns 204', async () => {
      hashCache.set('dev-user@test.com', 'ABCDEFG12345')

      const options = {
        method: 'DELETE',
        url: '/user/me/cache',
        ...portalHeader
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
