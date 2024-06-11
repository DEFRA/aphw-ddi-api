const { deleteDogsPayloadSchema, deleteDogsResponseSchema } = require('../../../../../app/schema/dogs/delete')

describe('deleteDogs schema', () => {
  describe('payload schema', () => {
    test('should allow list of persons to delete', () => {
      const payload = { dogPks: ['ED300006', 'ED300013'] }
      const { error, value } = deleteDogsPayloadSchema.validate(payload)
      expect(value).toEqual({ dogPks: ['ED300006', 'ED300013'] })
      expect(error).toBeUndefined()
    })

    test('should fail with empty dogPks array', () => {
      const payload = { dogPks: [] }
      const { error } = deleteDogsPayloadSchema.validate(payload)
      expect(error.message).toEqual('"dogPks" must contain at least 1 items')
    })

    test('should fail with additional params', () => {
      const payload = { dogPks: ['ED300006', 'ED300013'], x: true }
      const { error } = deleteDogsPayloadSchema.validate(payload)
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
          failed: ['ED300006'],
          success: ['ED300007', 'ED300020']
        }
      }

      const validation = deleteDogsResponseSchema.validate(expectedResponse, { abortEarly: false })
      expect(validation.error).toBeUndefined()
      expect(validation.value).toEqual(expectedResponse)
    })

    test('should allow empty contact results', () => {
      const expectedDeleteDogsResponse = {
        count: {
          failed: 0,
          success: 0
        },
        deleted: {
          failed: [],
          success: []
        }
      }

      const validation = deleteDogsResponseSchema.validate(expectedDeleteDogsResponse, { abortEarly: false })
      expect(validation.error).toBeUndefined()
      expect(validation.value).toEqual(expectedDeleteDogsResponse)
    })

    test('should not validate given empty object', () => {
      const validation = deleteDogsResponseSchema.validate({}, { abortEarly: false })
      expect(validation.error).toBeDefined()
    })
  })
})
