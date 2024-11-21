const { revertExpiredInsurance } = require('../../../../app/overnight/revert-expired-insurance')
const { overnightRowsInBreachInclExpiredInsurance, overnightRowsInBreachExclExpiredInsurance } = require('../../../mocks/overnight/overnight-rows')

const { dbFindAll, dbFindOne } = require('../../../../app/lib/db-functions')
jest.mock('../../../../app/lib/db-functions')

const { updateStatusOnly } = require('../../../../app/repos/status')
jest.mock('../../../../app/repos/status')

jest.mock('../../../../app/repos/dogs')
const { getCachedStatuses } = require('../../../../app/repos/dogs')
const { statuses: mockStatuses } = require('../../../mocks/statuses')

jest.mock('../../../../app/repos/breaches')
const { getBreachCategories } = require('../../../../app/repos/breaches')
const { BreachCategory } = require('../../../../app/data/domain')

describe('Revert Expired Insurance test', () => {
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn()
  }))

  beforeEach(async () => {
    jest.clearAllMocks()
    updateStatusOnly.mockResolvedValue()
    getCachedStatuses.mockResolvedValue(mockStatuses)
    getBreachCategories.mockResolvedValue([
      new BreachCategory({
        id: 11,
        label: 'dog insurance expired',
        short_name: 'INSURANCE_EXPIRED'
      })
    ])
  })

  test('revertExpiredInsurance should handle zero rows', async () => {
    dbFindAll.mockResolvedValue([])
    const res = await revertExpiredInsurance()
    expect(res).toBe('Success Revert In-breach Insurance to Exempt - updated 0 rows')
  })

  test('revertExpiredInsurance should handle error', async () => {
    dbFindAll.mockImplementation(() => { throw new Error('dummy error') })
    await expect(revertExpiredInsurance).rejects.toThrow('dummy error')
  })

  test('revertExpiredInsurance should handle some rows', async () => {
    dbFindAll.mockResolvedValue(overnightRowsInBreachInclExpiredInsurance)
    dbFindOne.mockResolvedValue({ id: 11 })
    const res = await revertExpiredInsurance()
    expect(res).toBe('Success Revert In-breach Insurance to Exempt - updated 2 rows')
  })

  test('revertExpiredInsurance should handle some rows', async () => {
    dbFindAll.mockResolvedValue(overnightRowsInBreachExclExpiredInsurance)
    dbFindOne.mockResolvedValue({ id: 11 })
    const res = await revertExpiredInsurance()
    expect(res).toBe('Success Revert In-breach Insurance to Exempt - updated 0 rows')
  })
})
