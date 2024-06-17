const { purgeSoftDeleteResponseSchema } = require('../../../../../app/schema/jobs')
describe('purge-soft-delete schema', () => {
  describe('purgeSoftDeleteResponseSchema', () => {
    test('should validate given correct response is sent', () => {
      const response = {
        count: {
          dogs: 2,
          owners: 1,
          total: 3
        },
        deleted: {
          dogs: ['ED100001', 'ED100002'],
          owners: ['P-1234-56']
        }
      }
      const { value, error } = purgeSoftDeleteResponseSchema.validate(response)
      expect(value).toEqual({
        count: {
          dogs: 2,
          owners: 1,
          total: 3
        },
        deleted: {
          dogs: ['ED100001', 'ED100002'],
          owners: ['P-1234-56']
        }
      })
      expect(error).toBeUndefined()
    })
  })
})
