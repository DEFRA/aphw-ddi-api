const { purgeSoftDeletedRecords } = require('../../../../app/overnight/purge-soft-deleted-records')
describe('purge-soft-deleted-records', () => {
  describe('purgeSoftDeletedRecords', () => {
    test('should be a function', async () => {
      expect(purgeSoftDeletedRecords).toBeInstanceOf(Function)
    })
  })
})
