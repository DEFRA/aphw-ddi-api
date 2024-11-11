const { createUserRequestSchema, fullUserResponseSchema, bulkRequestSchema, bulkResponseSchema } = require('../../../../../app/schema/user')
const { ValidationError } = require('joi')
const Joi = require('joi')
const { buildUserAccount, buildUserDto } = require('../../../../mocks/user-accounts')
describe('user schema', () => {
  describe('requestSchema', () => {
    test('should pass with valid schema', () => {
      const request = {
        username: 'john@smith.co.uk'
      }
      const validation = createUserRequestSchema.validate(request, { abortEarly: false })

      expect(validation).toEqual({ value: { username: 'john@smith.co.uk', active: true } })
      expect(validation.error).not.toBeDefined()
    })

    test('should pass with valid schema and police_force_id', () => {
      const request = {
        username: 'john@smith.co.uk',
        active: false,
        police_force_id: 1
      }
      const validation = createUserRequestSchema.validate(request, { abortEarly: false })

      expect(validation).toEqual({
        value: {
          username: 'john@smith.co.uk',
          active: false,
          police_force_id: 1
        }
      })
      expect(validation.error).not.toBeDefined()
    })

    test('should pass with valid schema and more properties', () => {
      const request = {
        username: 'john@smith.co.uk',
        police_force: 'ACME Police Force'
      }
      const validation = createUserRequestSchema.validate(request, { abortEarly: false })

      expect(validation).toEqual({
        value: {
          username: 'john@smith.co.uk',
          active: true,
          police_force: 'ACME Police Force'
        }
      })
      expect(validation.error).not.toBeDefined()
    })

    test('should not pass if username is not an email', () => {
      const request = {
        username: 'john.smith'
      }
      const validation = createUserRequestSchema.validate(request, { abortEarly: false })

      expect(validation.error).toEqual(new ValidationError('"username" must be a valid email'))
    })

    test('should not pass with empty payload', () => {
      const payload = {}
      const validation = createUserRequestSchema.validate(payload, { abortEarly: false })

      expect(validation.error).toEqual(new ValidationError('"username" is required'))
    })
  })

  describe('responseSchema', () => {
    test('should pass with valid schema', () => {
      const response = {
        id: 1,
        username: 'john@smith.co.uk'
      }
      const validation = fullUserResponseSchema.validate(response, { abortEarly: false })

      expect(validation).toEqual({
        value: {
          id: 1,
          username: 'john@smith.co.uk',
          active: true
        }
      })
      expect(validation.error).not.toBeDefined()
    })

    test('should pass with valid schema and all properties', () => {
      const response = buildUserDto({
        id: 1,
        username: 'john@eastern.police.uk',
        active: false,
        policeForceId: 1,
        policeForce: 'Eastern police',
        accepted: new Date('2024-10-11'),
        activated: new Date('2024-10-11'),
        lastLogin: new Date('2024-11-11'),
        createdAt: new Date('2024-10-10')
      })
      const validation = fullUserResponseSchema.validate(response, { abortEarly: false })

      expect(validation).toEqual({
        value: {
          id: 1,
          username: 'john@eastern.police.uk',
          active: false,
          policeForceId: 1,
          policeForce: 'Eastern police',
          accepted: new Date('2024-10-11'),
          activated: new Date('2024-10-11'),
          lastLogin: new Date('2024-11-11'),
          createdAt: new Date('2024-10-10')
        }
      })
      expect(validation.error).not.toBeDefined()
    })

    test('should not pass with empty payload', () => {
      const payload = {}
      const validation = fullUserResponseSchema.validate(payload, { abortEarly: false })

      expect(validation.error).toEqual(new ValidationError('"id" is required. "username" is required'))
    })
  })

  describe('bulkRequestSchema', () => {
    test('should validate with correct', () => {
      const request = {
        users: [
          {
            username: 'joe.bloggs@avonandsomerset.police.uk'
          },
          {
            username: 'jane.doe@avonandsomerset.police.uk'
          },
          {
            username: 'john.smith@example.com'
          }
        ]
      }

      const validation = bulkRequestSchema.validate(request, { abortEarly: false })

      expect(validation).toEqual({
        value: {
          users: [
            {
              username: 'joe.bloggs@avonandsomerset.police.uk',
              active: true
            },
            {
              username: 'jane.doe@avonandsomerset.police.uk',
              active: true
            },
            {
              username: 'john.smith@example.com',
              active: true
            }
          ]
        }
      })
      expect(validation.error).not.toBeDefined()
    })

    test('should require a min of 1 users', () => {
      const request = {
        users: []
      }

      const validation = bulkRequestSchema.validate(request, { abortEarly: false })

      expect(validation.error).toEqual(new ValidationError('"users" must contain at least 1 items'))
    })

    test('should fail with empty payload', () => {
      const request = {}

      const validation = bulkRequestSchema.validate(request, { abortEarly: false })

      expect(validation.error).toEqual(new ValidationError('"users" is required'))
    })
  })

  describe('bulkResponseSchema', () => {
    test('should succeed with valid schema', () => {
      const response = {
        users: [
          {
            id: 1,
            username: 'john.smith@acme.police.gov',
            active: true,
            policeForceId: 2
          },
          {
            id: 1,
            username: 'user@example.com',
            active: true,
            policeForceId: undefined
          }
        ]
      }
      const validation = bulkResponseSchema.validate(response, { abortEarly: false })

      expect(validation.value).toEqual({
        users: [
          {
            id: 1,
            username: 'john.smith@acme.police.gov',
            active: true,
            policeForceId: 2
          },
          {
            id: 1,
            username: 'user@example.com',
            active: true
          }
        ]
      })
      expect(validation.error).not.toBeDefined()
    })

    test('should succeed with error list', () => {
      const response = {
        users: [],
        errors: [
          {
            username: 'john.smith@acme.police.gov',
            statusCode: 409,
            message: 'conflict'
          },
          {
            username: 'user@example.com',
            error: 'error',
            statusCode: 500,
            message: 'error'
          }
        ]
      }
      const validation = bulkResponseSchema.validate(response, { abortEarly: false })

      expect(validation.value).toEqual({
        users: [],
        errors: [
          {
            username: 'john.smith@acme.police.gov',
            statusCode: 409,
            message: 'conflict'
          },
          {
            username: 'user@example.com',
            error: 'error',
            statusCode: 500,
            message: 'error'
          }
        ]
      })
      expect(validation.error).not.toBeDefined()
    })
  })

  test('should fail with empty payload', () => {
    const response = {}

    const validation = bulkResponseSchema.validate(response, { abortEarly: false })

    expect(validation.error).toEqual(new ValidationError('"users" is required'))
  })
})
