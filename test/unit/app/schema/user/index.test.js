const { createUserRequestSchema, createUserResponseSchema, bulkRequestSchema, bulkResponseSchema } = require('../../../../../app/schema/user')
const { ValidationError } = require('joi')
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
      const validation = createUserResponseSchema.validate(response, { abortEarly: false })

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
      const response = {
        id: 1,
        username: 'john@smith.co.uk',
        active: false,
        police_force_id: 1
      }
      const validation = createUserResponseSchema.validate(response, { abortEarly: false })

      expect(validation).toEqual({
        value: {
          id: 1,
          username: 'john@smith.co.uk',
          active: false,
          police_force_id: 1
        }
      })
      expect(validation.error).not.toBeDefined()
    })

    test('should not pass with empty payload', () => {
      const payload = {}
      const validation = createUserResponseSchema.validate(payload, { abortEarly: false })

      expect(validation.error).toEqual(new ValidationError('"id" is required. "username" is required'))
    })
  })

  describe('bulkRequestSchema', () => {
    it('should validate with correct', () => {
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

    it('should require a min of 1 users', () => {
      const request = {
        users: []
      }

      const validation = bulkRequestSchema.validate(request, { abortEarly: false })

      expect(validation.error).toEqual(new ValidationError('"users" must contain at least 1 items'))
    })

    it('should fail with empty payload', () => {
      const request = {}

      const validation = bulkRequestSchema.validate(request, { abortEarly: false })

      expect(validation.error).toEqual(new ValidationError('"users" is required'))
    })
  })

  describe('bulkResponseSchema', () => {
    it('should succeed with valid schema', () => {
      const response = {
        users: [
          {
            id: 1,
            username: 'john.smith@acme.police.gov',
            active: true,
            police_force_id: 2
          },
          {
            id: 1,
            username: 'user@example.com',
            active: true,
            police_force_id: undefined
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
            police_force_id: 2
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

    it('should succeed with error list', () => {
      const response = {
        users: [],
        errors: [
          {
            username: 'john.smith@acme.police.gov',
            code: 409,
            message: 'conflict'
          },
          {
            username: 'user@example.com',
            code: 500,
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
            code: 409,
            message: 'conflict'
          },
          {
            username: 'user@example.com',
            code: 500,
            message: 'error'
          }
        ]
      })
      expect(validation.error).not.toBeDefined()
    })
  })

  it('should fail with empty payload', () => {
    const response = {}

    const validation = bulkResponseSchema.validate(response, { abortEarly: false })

    expect(validation.error).toEqual(new ValidationError('"users" is required'))
  })
})
