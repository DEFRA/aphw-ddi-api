const { mockValidate, mockValidateEnforcement } = require('../../../mocks/auth')
const { portalHeader, enforcementHeader, portalStandardHeader } = require('../../../mocks/jwt')
const { buildUserAccount } = require('../../../mocks/user-accounts')

describe('User endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')

  jest.mock('../../../../app/service/config')
  const { getRegistrationService } = require('../../../../app/service/config')

  jest.mock('../../../../app/repos/user-accounts')
  const { createAccount, deleteAccount, createAccounts, getAccounts } = require('../../../../app/repos/user-accounts')

  jest.mock('../../../../app/messaging/send-email')
  const { sendEmail } = require('../../../../app/messaging/send-email')

  jest.mock('../../../../app/cache')
  const { drop } = require('../../../../app/cache')

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
    sendEmail.mockResolvedValue()
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
      }, expect.objectContaining({
        displayname: 'dev-user@test.com',
        username: 'dev-user@test.com'
      }))
      expect(JSON.parse(response.payload)).toEqual(expectedPayload)
    })

    test('should return 400 if request is from enforcement', async () => {
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

  describe('GET /users', () => {
    test('should get a list of users', async () => {
      const userAccounts = [
        buildUserAccount({
          id: 1,
          username: 'ralph@wreckit.com'
        }),
        buildUserAccount({
          id: 2,
          username: 'scott.turner@sacramento.police.gov',
          police_force_id: 2
        }),
        buildUserAccount({
          id: 3,
          username: 'axel.foley@beverly-hills.police.gov',
          police_force_id: 3
        })
      ]

      getAccounts.mockResolvedValue(userAccounts)

      const options = {
        method: 'GET',
        url: '/users',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(getAccounts).toHaveBeenCalledWith()
      expect(JSON.parse(response.payload)).toEqual({
        users: [
          {
            id: 1,
            username: 'ralph@wreckit.com',
            active: true
          },
          {
            id: 2,
            username: 'scott.turner@sacramento.police.gov',
            police_force_id: 2,
            active: true
          },
          {
            id: 3,
            username: 'axel.foley@beverly-hills.police.gov',
            police_force_id: 3,
            active: true
          }
        ]
      })
    })

    test('should return 400 if request is from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)
      createAccount.mockResolvedValue({
        username: 'ralph@wreckit.com',
        active: true
      })
      const options = {
        method: 'GET',
        url: '/users',
        ...enforcementHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
      expect(createAccount).not.toHaveBeenCalled()
    })

    test('should return 400 if request is from standard user', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)
      createAccount.mockResolvedValue({
        username: 'ralph@wreckit.com',
        active: true
      })
      const options = {
        method: 'GET',
        url: '/users',
        ...portalStandardHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
      expect(createAccount).not.toHaveBeenCalled()
    })
  })

  describe('POST /users', () => {
    test('should bulk add users', async () => {
      createAccounts.mockResolvedValue({
        items: [
          buildUserAccount({
            id: 1,
            username: 'ralph@wreckit.com'
          }),
          buildUserAccount({
            id: 2,
            username: 'scott.turner@sacramento.police.gov',
            police_force_id: 2
          })
        ]
      })

      const expectedPayload = {
        users: [
          {
            id: 1,
            active: true,
            username: 'ralph@wreckit.com'
          },
          {
            id: 2,
            active: true,
            username: 'scott.turner@sacramento.police.gov',
            police_force_id: 2
          }
        ]
      }

      const options = {
        method: 'POST',
        url: '/users',
        payload: {
          users: [
            {
              username: 'joe.bloggs@avonandsomerset.police.uk'
            },
            {
              username: 'jane.bloggs@example.com'
            }
          ]
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(createAccounts).toHaveBeenCalledWith([
        {
          username: 'joe.bloggs@avonandsomerset.police.uk',
          active: true
        },
        {
          username: 'jane.bloggs@example.com',
          active: true
        }
      ], expect.objectContaining({
        displayname: 'dev-user@test.com',
        username: 'dev-user@test.com'
      }))
      expect(JSON.parse(response.payload)).toEqual(expectedPayload)
    })

    test('should bulk add users and return 400 if there are some errors', async () => {
      createAccounts.mockResolvedValue({
        items: [
          buildUserAccount({
            id: 1,
            username: 'ralph@wreckit.com'
          })
        ],
        errors: [
          {
            statusCode: 409,
            error: 'conflict',
            message: 'conflict',
            data: { username: 'scott.turner@sacramento.police.gov' }
          },
          {
            statusCode: 500,
            message: 'error',
            data: { username: 'invalid@example.com' }
          }
        ]
      })

      const expectedPayload = {
        users: [
          {
            id: 1,
            active: true,
            username: 'ralph@wreckit.com'
          }
        ],
        errors: [
          {
            statusCode: 409,
            error: 'conflict',
            message: 'conflict',
            username: 'scott.turner@sacramento.police.gov'
          },
          {
            statusCode: 500,
            message: 'error',
            username: 'invalid@example.com'
          }
        ]
      }

      const options = {
        method: 'POST',
        url: '/users',
        payload: {
          users: [
            {
              username: 'joe.bloggs@avonandsomerset.police.uk'
            },
            {
              username: 'jane.bloggs@example.com'
            },
            {
              username: 'invalid@example.com'
            }
          ]
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.payload)).toEqual(expectedPayload)
    })

    test('should return 409 if all the responses are conflicts', async () => {
      createAccounts.mockResolvedValue({
        items: [],
        errors: [
          {
            statusCode: 409,
            message: 'conflict',
            data: { username: 'ralph@wreckit.com' }
          },
          {
            statusCode: 409,
            message: 'conflict',
            data: { username: 'scott.turner@sacramento.police.gov' }
          }
        ]
      })

      const expectedPayload = {
        users: [],
        errors: [
          {
            statusCode: 409,
            message: 'conflict',
            username: 'ralph@wreckit.com'
          },
          {
            statusCode: 409,
            message: 'conflict',
            username: 'scott.turner@sacramento.police.gov'
          }
        ]
      }

      const options = {
        method: 'POST',
        url: '/users',
        payload: {
          users: [
            {
              username: 'joe.bloggs@avonandsomerset.police.uk'
            },
            {
              username: 'jane.bloggs@example.com'
            }
          ]
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
      expect(JSON.parse(response.payload)).toEqual(expectedPayload)
    })

    test('should return 500 if all the responses are conflicts', async () => {
      createAccounts.mockResolvedValue({
        items: [],
        errors: [
          {
            statusCode: 500,
            message: 'conflict',
            data: { username: 'ralph@wreckit.com' }
          },
          {
            statusCode: 500,
            message: 'conflict',
            data: { username: 'scott.turner@sacramento.police.gov' }
          }
        ]
      })

      const expectedPayload = {
        users: [],
        errors: [
          {
            statusCode: 500,
            message: 'conflict',
            username: 'ralph@wreckit.com'
          },
          {
            statusCode: 500,
            message: 'conflict',
            username: 'scott.turner@sacramento.police.gov'
          }
        ]
      }

      const options = {
        method: 'POST',
        url: '/users',
        payload: {
          users: [
            {
              username: 'joe.bloggs@avonandsomerset.police.uk'
            },
            {
              username: 'jane.bloggs@example.com'
            }
          ]
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
      expect(JSON.parse(response.payload)).toEqual(expectedPayload)
    })

    test('should return 400 if request is from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)
      createAccount.mockResolvedValue({
        username: 'ralph@wreckit.com',
        active: true
      })
      const options = {
        method: 'POST',
        url: '/users',
        payload: {
          users: [
            {
              username: 'joe.bloggs@avonandsomerset.police.uk'
            },
            {
              username: 'jane.bloggs@example.com'
            }
          ]
        },
        ...enforcementHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
      expect(createAccount).not.toHaveBeenCalled()
    })

    test('should return 400 if request is from standard user', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)
      createAccount.mockResolvedValue({
        username: 'ralph@wreckit.com',
        active: true
      })
      const options = {
        method: 'POST',
        url: '/users',
        payload: {
          users: [
            {
              username: 'joe.bloggs@avonandsomerset.police.uk'
            },
            {
              username: 'jane.bloggs@example.com'
            }
          ]
        },
        ...portalStandardHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
      expect(createAccount).not.toHaveBeenCalled()
    })

    test('should return 400 with invalid payload', async () => {
      const options = {
        method: 'POST',
        url: '/users',
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
        expect.objectContaining({
          displayname: 'dev-user@test.com',
          username: 'dev-user@test.com'
        }))
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
      const options = {
        method: 'DELETE',
        url: '/user/me/cache',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(204)
      expect(drop).toHaveBeenCalledWith(expect.anything(), 'dev-user@test.com')
    })
  })

  describe('POST /user/me/feedback', () => {
    test('should return 400 if payload error', async () => {
      const options = {
        method: 'POST',
        url: '/user/me/feedback',
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('should return a 200 with valid payload', async () => {
      const options = {
        method: 'POST',
        url: '/user/me/feedback',
        ...portalHeader,
        payload: {
          fields: [
            { name: 'field1', value: 'value1' }
          ]
        }
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual({ result: 'Ok' })
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
