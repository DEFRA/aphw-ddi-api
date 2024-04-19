const { bulkUpdateOutOfBreach } = require('../../../../app/overnight/bulk-update-out-of-breach')
const { overnightRowsInBreach: mockOvernightRows } = require('../../../mocks/overnight/overnight-rows')

const { dbFindAll, dbFindOne } = require('../../../../app/lib/db-functions')
jest.mock('../../../../app/lib/db-functions')

const { updateStatusOnly } = require('../../../../app/repos/status')
jest.mock('../../../../app/repos/status')

describe('BulkUpdateOutOfBreach test', () => {
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn()
  }))

  beforeEach(async () => {
    jest.clearAllMocks()
    updateStatusOnly.mockResolvedValue()
  })

  test('should handle zero rows', async () => {
    dbFindAll.mockResolvedValue([])
    const res = await bulkUpdateOutOfBreach()
    expect(res).toBe('Success Bulk Update From Breach - updated 0 rows')
  })

  test('should handle error', async () => {
    dbFindAll.mockImplementation(() => { throw new Error('dummy error') })
    await expect(bulkUpdateOutOfBreach).rejects.toThrow('dummy error')
  })

  test('should skip if already run', async () => {
    dbFindAll.mockResolvedValue(mockOvernightRows)
    dbFindOne.mockResolvedValue({})
    const res = await bulkUpdateOutOfBreach()
    expect(res).toBe('Skipped Bulk Update From Breach')
  })

  test('should handle some rows', async () => {
    dbFindAll.mockResolvedValue(mockOvernightRows)
    dbFindOne.mockResolvedValue()
    const res = await bulkUpdateOutOfBreach()
    expect(res).toBe('Success Bulk Update From Breach - updated 2 rows')
  })
})
