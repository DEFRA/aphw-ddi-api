const { createUserRequestSchema, createUserResponseSchema } = require('../../../../../app/schema/user')
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

    test('should not pass with empty payload', () => {
      const payload = {}
      const validation = createUserRequestSchema.validate(payload, { abortEarly: false })

      expect(validation.error).toEqual(new ValidationError('"username" is required'))
    })
  })

  describe('responseSchema', () => {
    test('should pass with valid schema', () => {
      const request = {
        username: 'john@smith.co.uk'
      }
      const validation = createUserResponseSchema.validate(request, { abortEarly: false })

      expect(validation).toEqual({ value: { username: 'john@smith.co.uk', active: true } })
      expect(validation.error).not.toBeDefined()
    })

    test('should pass with valid schema and all properties', () => {
      const request = {
        username: 'john@smith.co.uk',
        active: false,
        police_force_id: 1
      }
      const validation = createUserResponseSchema.validate(request, { abortEarly: false })

      expect(validation).toEqual({
        value: {
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

      expect(validation.error).toEqual(new ValidationError('"username" is required'))
    })
  })
})
