const { setExpiredNeuteringDeadlineToInBreach, addBreachReasonToExpiredNeuteringDeadline, ignoreOrderAndBreedCombination } = require('../../../../app/overnight/expired-neutering-deadline')
const { overnightRowsWithNeuteringDeadline: mockOvernightRowsWithNeuteringDeadline } = require('../../../mocks/overnight/overnight-rows')

const { dbFindAll, dbFindOne } = require('../../../../app/lib/db-functions')
jest.mock('../../../../app/lib/db-functions')

const { Op } = require('sequelize')

jest.mock('../../../../app/repos/dogs')
const { getCachedStatuses } = require('../../../../app/repos/dogs')
const { statuses: mockStatuses } = require('../../../mocks/statuses')

jest.mock('../../../../app/repos/breaches')
const { getBreachCategories } = require('../../../../app/repos/breaches')
const { BreachCategory } = require('../../../../app/data/domain')

jest.mock('../../../../app/service/config')
const { getDogService } = require('../../../../app/service/config')

jest.mock('../../../../app/repos/status')

describe('ExpiredNeuteringDeadline test', () => {
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn()
  }))

  beforeEach(async () => {
    jest.clearAllMocks()
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

  describe('setExpiredNeuteringDeadlineToInBreach', () => {
    test('should handle zero rows', async () => {
      dbFindAll.mockResolvedValue([])
      const res = await setExpiredNeuteringDeadlineToInBreach()
      expect(res).toBe('Success Neutering Expiry - updated 0 rows')
    })

    test('should handle error', async () => {
      dbFindAll.mockImplementation(() => { throw new Error('dummy error') })
      await expect(setExpiredNeuteringDeadlineToInBreach).rejects.toThrow('dummy error')
    })

    test('should handle some rows given a date prior to deadline expiry', async () => {
      dbFindAll.mockResolvedValue(mockOvernightRowsWithNeuteringDeadline)
      const today = new Date('2024-10-01')
      const res = await setExpiredNeuteringDeadlineToInBreach(today)

      expect(dbFindAll).toHaveBeenCalledWith(undefined, expect.objectContaining({
        where: expect.objectContaining({
          neutering_deadline: {
            [Op.lt]: today
          }
        })
      }))
      expect(res).toBe('Success Neutering Expiry - updated 5 rows')
    })
  })

  describe('addBreachReasonToExpiredNeuteringDeadline', () => {
    test('should handle all rows given date is after expiry', async () => {
      dbFindAll.mockResolvedValue(mockOvernightRowsWithNeuteringDeadline.filter(row => row.dog.status.status === 'In breach'))
      dbFindOne.mockResolvedValue({ id: 12 })
      const today = new Date('2025-01-01')
      const res = await addBreachReasonToExpiredNeuteringDeadline(today)

      expect(dbFindAll).toHaveBeenCalledWith(undefined, expect.objectContaining({
        where: expect.objectContaining({
          neutering_deadline: {
            [Op.lt]: today
          }
        })
      }))
      expect(res).toBe('Success Neutering Expiry add breach reason - updated 2 rows')
    })

    test('should handle some rows given date after for some and before for some', async () => {
      const today = new Date('2024-10-17')
      dbFindAll.mockResolvedValue(mockOvernightRowsWithNeuteringDeadline.filter(row => row.dog.status.status === 'In breach' && new Date(row.dog.exemption.neutering_deadline) < today))
      dbFindOne.mockResolvedValue({ id: 12 })
      const res = await addBreachReasonToExpiredNeuteringDeadline(today)

      expect(dbFindAll).toHaveBeenCalledWith(undefined, expect.objectContaining({
        where: expect.objectContaining({
          neutering_deadline: {
            [Op.lt]: today
          }
        })
      }))
      expect(res).toBe('Success Neutering Expiry add breach reason - updated 1 rows')
    })

    test('should throw if error', async () => {
      dbFindAll.mockResolvedValue(() => { throw new Error('dummy') })
      dbFindOne.mockResolvedValue({ id: 12 })
      const today = new Date('2025-01-01')
      await expect(addBreachReasonToExpiredNeuteringDeadline(today)).rejects.toThrow('Error auto-updating statuses when Neutering Expiry add breach reason: TypeError: addBreachReason is not iterable')
    })
  })

  describe('ignoreOrderAndBreedCombination', () => {
    test('should return false for 2023', async () => {
      const registration = { exemption_order: { exemption_order: '2023' } }
      const res = await ignoreOrderAndBreedCombination(registration)
      expect(res).toBeFalsy()
    })

    test('should return false for 2015 XLB', async () => {
      const registration = { exemption_order: { exemption_order: '2015' }, dog: { dog_breed: { breed: 'XL Bully' } } }
      const res = await ignoreOrderAndBreedCombination(registration)
      expect(res).toBeFalsy()
    })

    test('should return true for 2015 other breeds', async () => {
      const registration = { exemption_order: { exemption_order: '2015' }, dog: { dog_breed: { breed: 'other breed' } } }
      const res = await ignoreOrderAndBreedCombination(registration)
      expect(res).toBeTruthy()
    })

    test('should return true for 1991', async () => {
      const registration = { exemption_order: { exemption_order: '1991' } }
      const res = await ignoreOrderAndBreedCombination(registration)
      expect(res).toBeTruthy()
    })
  })
})
