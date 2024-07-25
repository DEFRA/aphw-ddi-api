const { purgeSoftDeleteResponseSchema } = require('../../../../../app/schema/jobs')
describe('purge-soft-delete schema', () => {
  describe('purgeSoftDeleteResponseSchema', () => {
    test('should validate given correct response is sent', () => {
      const response = {
        count: {
          success: {
            dogs: 0,
            owners: 2,
            total: 2
          },
          failed: {
            dogs: 0,
            owners: 0,
            total: 0
          }
        },
        deleted: {
          success: {
            dogs: [],
            owners: [
              'P-E947-BBAE',
              'P-12BB-D33F'
            ]
          },
          failed: {
            dogs: [],
            owners: []
          }
        }
      }
      const { value, error } = purgeSoftDeleteResponseSchema.validate(response)
      expect(value).toEqual({
        count: {
          success: {
            dogs: 0,
            owners: 2,
            total: 2
          },
          failed: {
            dogs: 0,
            owners: 0,
            total: 0
          }
        },
        deleted: {
          success: {
            dogs: [],
            owners: [
              'P-E947-BBAE',
              'P-12BB-D33F'
            ]
          },
          failed: {
            dogs: [],
            owners: []
          }
        }
      })
      expect(error).toBeUndefined()
    })
  })
})
