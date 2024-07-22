const { setExpiredInsuranceToBreach } = require('../../../../app/overnight/expired-insurance')
const { overnightRows: mockOvernightRows } = require('../../../mocks/overnight/overnight-rows')

const { dbFindAll } = require('../../../../app/lib/db-functions')
jest.mock('../../../../app/lib/db-functions')

const { updateStatusOnly } = require('../../../../app/repos/status')
jest.mock('../../../../app/repos/status')

jest.mock('../../../../app/repos/dogs')
const { getCachedStatuses } = require('../../../../app/repos/dogs')
const { statuses: mockStatuses } = require('../../../mocks/statuses')

jest.mock('../../../../app/repos/breaches')
const { getBreachCategories } = require('../../../../app/repos/breaches')
const { BreachCategory } = require('../../../../app/data/domain')

describe('ExpiredInsurance test', () => {
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

  test('setExpiredInsuranceToBreach should handle zero rows', async () => {
    dbFindAll.mockResolvedValue([])
    const res = await setExpiredInsuranceToBreach()
    expect(res).toBe('Success Insurance Expiry - updated 0 rows')
  })

  test('setExpiredInsuranceToBreach should handle error', async () => {
    dbFindAll.mockImplementation(() => { throw new Error('dummy error') })
    await expect(setExpiredInsuranceToBreach).rejects.toThrow('dummy error')
  })

  test('setExpiredInsuranceToBreach should handle some rows', async () => {
    dbFindAll.mockResolvedValue(mockOvernightRows)
    const res = await setExpiredInsuranceToBreach()
    expect(res).toBe('Success Insurance Expiry - updated 3 rows')
  })
})
