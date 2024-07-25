const { deletePayloadSchema } = require('../../../../../app/schema/persons/delete')
const { deleteResponseSchema } = require('../../../../../app/schema/shared/delete')

describe('deletePersons schema', () => {
  describe('payload schema', () => {
    test('should allow list of persons to delete', () => {
      const payload = { personReferences: ['P-1234-567', 'P-2345-678'] }
      const { error, value } = deletePayloadSchema.validate(payload)
      expect(value).toEqual({ personReferences: ['P-1234-567', 'P-2345-678'] })
      expect(error).toBeUndefined()
    })

    test('should fail with empty personReferences array', () => {
      const payload = { personReferences: [] }
      const { error } = deletePayloadSchema.validate(payload)
      expect(error.message).toEqual('"personReferences" must contain at least 1 items')
    })

    test('should fail with additional params', () => {
      const payload = { personReferences: ['P-1234-567', 'P-2345-678'], x: true }
      const { error } = deletePayloadSchema.validate(payload)
      expect(error.message).toEqual('"x" is not allowed')
    })
  })

  describe('response', () => {
    test('should return correct response schema', () => {
      const expectedResponse = {
        count: {
          failed: 1,
          success: 2
        },
        deleted: {
          failed: ['P-DB0D-A045'],
          success: ['P-1234-567', 'P-2345-678']
        }
      }

      const validation = deleteResponseSchema.validate(expectedResponse, { abortEarly: false })
      expect(validation.error).toBeUndefined()
      expect(validation.value).toEqual(expectedResponse)
    })

    test('should allow empty contact results', () => {
      const expectedResponse = {
        count: {
          failed: 0,
          success: 0
        },
        deleted: {
          failed: [],
          success: []
        }
      }

      const validation = deleteResponseSchema.validate(expectedResponse, { abortEarly: false })
      expect(validation.error).toBeUndefined()
      expect(validation.value).toEqual(expectedResponse)
    })

    test('should not validate given empty object', () => {
      const validation = deleteResponseSchema.validate({}, { abortEarly: false })
      expect(validation.error).toBeDefined()
    })
  })
})
