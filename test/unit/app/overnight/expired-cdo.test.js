const { setExpiredCdosToFailed } = require('../../../../app/overnight/expired-cdo')
const { overnightRows: mockOvernightRows } = require('../../../mocks/overnight/overnight-rows')

const { dbFindAll } = require('../../../../app/lib/db-functions')
jest.mock('../../../../app/lib/db-functions')

const { updateStatusOnly } = require('../../../../app/repos/status')
jest.mock('../../../../app/repos/status')

describe('ExpiredCdo test', () => {
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn()
  }))

  beforeEach(async () => {
    jest.clearAllMocks()
    updateStatusOnly.mockResolvedValue()
  })

  test('setExpiredCdosToFailed should handle zero rows', async () => {
    dbFindAll.mockResolvedValue([])
    const res = await setExpiredCdosToFailed()
    expect(res).toBe('Success CDO Expiry - updated 0 rows | ')
  })

  test('setExpiredCdosToFailed should handle error', async () => {
    dbFindAll.mockImplementation(() => { throw new Error('dummy error') })
    await expect(setExpiredCdosToFailed).rejects.toThrow('dummy error')
  })

  test('setExpiredCdosToFailed should handle some rows', async () => {
    dbFindAll.mockResolvedValue(mockOvernightRows)
    const res = await setExpiredCdosToFailed()
    expect(res).toBe('Success CDO Expiry - updated 3 rows | ')
  })
})
