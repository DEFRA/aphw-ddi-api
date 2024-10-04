const { setExpiredInsuranceToBreach, addBreachReasonToExpiredInsurance } = require('../../../../app/overnight/expired-insurance')
const { overnightRows: mockOvernightRows, overnightRowsInBreach: mockOvernightRowsInBreach } = require('../../../mocks/overnight/overnight-rows')

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

jest.mock('../../../../app/service/config')
const { getDogService } = require('../../../../app/service/config')

describe('ExpiredInsurance test', () => {
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn()
  }))

  beforeEach(async () => {
    jest.clearAllMocks()
    updateStatusOnly.mockResolvedValue()
    getCachedStatuses.mockResolvedValue(mockStatuses)
    getDogService.mockReturnValue({
      setBreaches: jest.fn(),
      setBreach: jest.fn()
    })
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
    expect(res).toBe('Success Insurance Expiry to Breach - updated 0 rows')
  })

  test('setExpiredInsuranceToBreach should handle error', async () => {
    dbFindAll.mockImplementation(() => { throw new Error('dummy error') })
    await expect(setExpiredInsuranceToBreach).rejects.toThrow('dummy error')
  })

  test('setExpiredInsuranceToBreach should handle some rows', async () => {
    dbFindAll.mockResolvedValue(mockOvernightRows)
    const res = await setExpiredInsuranceToBreach()
    expect(res).toBe('Success Insurance Expiry to Breach - updated 3 rows')
  })

  test('addBreachReasonToExpiredInsurance should handle some rows', async () => {
    dbFindAll.mockResolvedValue(mockOvernightRowsInBreach)
    dbFindOne.mockResolvedValue(11)
    const res = await addBreachReasonToExpiredInsurance()
    expect(res).toBe('Success Insurance Expiry add breach reason - updated 2 rows')
  })

  test('addBreachReasonToExpiredInsurance should throw if error', async () => {
    dbFindAll.mockResolvedValue(() => { throw new Error('dummy') })
    dbFindOne.mockResolvedValue(11)
    await expect(addBreachReasonToExpiredInsurance()).rejects.toThrow('Error auto-updating statuses when Insurance Expiry add breach reason: TypeError: addBreachReason is not iterable')
  })
})
