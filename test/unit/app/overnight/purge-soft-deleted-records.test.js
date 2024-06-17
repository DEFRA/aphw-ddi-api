const { purgeSoftDeletedRecords } = require('../../../../app/overnight/purge-soft-deleted-records')
describe('purge-soft-deleted-records', () => {
  describe('purgeSoftDeletedRecords', () => {
    test('should be a function', async () => {
      const result = await purgeSoftDeletedRecords(new Date())
      expect(result).toEqual({
        count: {
          dogs: 0,
          owners: 0,
          total: 0
        },
        deleted: {
          dogs: [],
          owners: []
        }
      })
    })
  })
})
