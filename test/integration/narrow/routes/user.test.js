const { mockValidate, mockValidateEnforcement } = require('../../../mocks/auth')
const { portalHeader, enforcementHeader } = require('../../../mocks/jwt')

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

  jest.mock('../../../../app/repos/user-accounts')
  const { createAccount, deleteAccount } = require('../../../../app/repos/user-accounts')

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

  describe('POST /user', () => {
    test('should add a new user and return a 201 for admin user', async () => {
      const expectedPayload = {
        id: 2,
        police_force_id: 1,
        username: 'ralph@wreckit.com',
        active: true
      }
      createAccount.mockResolvedValue({
        username: 'ralph@wreckit.com',
        created_at: '2024-09-27T15:18:36.563Z',
        updated_at: '2024-09-27T15:18:36.563Z',
        id: 2,
        police_force_id: 1,
        active: true,
        telephone: null,
        activation_token: null,
        activation_token_expiry: null,
        activated_date: null,
        accepted_terms_and_conds_date: null,
        last_login_date: null,
        deleted_at: null
      })
      const options = {
        method: 'POST',
        url: '/user',
        payload: {
          username: 'ralph@wreckit.com'
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(201)
      expect(createAccount).toHaveBeenCalledWith({
        username: 'ralph@wreckit.com',
        active: true
      }, {
        username: 'dev-user@test.com',
        displayname: 'dev-user@test.com'
      })
      expect(JSON.parse(response.payload)).toEqual(expectedPayload)
    })

    test('should return 403 if request is from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)
      createAccount.mockResolvedValue({
        username: 'ralph@wreckit.com',
        active: true
      })
      const options = {
        method: 'POST',
        url: '/user',
        payload: {
          username: 'ralph@wreckit.com'
        },
        ...enforcementHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
      expect(createAccount).not.toHaveBeenCalled()
    })

    test('should return 400 with invalid payload', async () => {
      const options = {
        method: 'POST',
        url: '/user',
        payload: {},
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
      expect(createAccount).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /user/:id', () => {
    test('should delete a user and return a 204 for admin user', async () => {
      const expectedPayload = ''

      const options = {
        method: 'DELETE',
        url: '/user/5',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(204)
      expect(deleteAccount).toHaveBeenCalledWith(
        '5',
        {
          displayname: 'dev-user@test.com',
          username: 'dev-user@test.com'
        })
      expect(response.payload).toEqual(expectedPayload)
    })
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
      expect(JSON.parse(response.payload)).toEqual({ result: true })
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
      expect(JSON.parse(response.payload)).toEqual({ result: false })
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
      expect(JSON.parse(response.payload)).toEqual({ result: true })
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
      expect(JSON.parse(response.payload)).toEqual({ result: false })
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
      expect(JSON.parse(response.payload)).toEqual({ result: true })
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
      expect(JSON.parse(response.payload).message).toBe('An internal server error occurred')
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
      expect(JSON.parse(response.payload)).toEqual({ result: 'Ok' })
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
      expect(JSON.parse(response.payload)).toEqual({ result: 'Invalid code' })
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
