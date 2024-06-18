const { purgeSoftDeleteResponseSchema } = require('../../../../app/schema/jobs')
const { purgeSoftDeletedDto } = require('../../../../app/dto/overnight')
describe('overnight', () => {
  describe('purgeSoftDeletedDto', () => {
    const expectedPurgeSoftDeletedDto = {
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

    const purgeSoftDeletedResponse = {
      ...expectedPurgeSoftDeletedDto,
      toString: () => ''
    }

    test('should ', () => {
      const response = purgeSoftDeletedDto(purgeSoftDeletedResponse)
      const { value, error } = purgeSoftDeleteResponseSchema.validate(response)
      expect(response).toEqual(expectedPurgeSoftDeletedDto)
      expect(error).toBeUndefined()
      expect(value).toEqual(expectedPurgeSoftDeletedDto)
    })
  })
})
