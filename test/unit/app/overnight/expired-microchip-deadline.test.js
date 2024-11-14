const { setExpiredMicrochipDeadlineToInBreach, addBreachReasonToExpiredMicrochipDeadline } = require('../../../../app/overnight/expired-microchip-deadline')
const { overnightRowsWithMicrochipDeadline: mockOvernightRowsWithMicrochipDeadline } = require('../../../mocks/overnight/overnight-rows')

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
        id: 16,
        label: 'dog not microchipped by microchipping deadline',
        short_name: 'MICROCHIP_DEADLINE_EXCEEDED'
      })
    ])
  })

  describe('setExpiredMicrochipDeadlineToInBreach', () => {
    test('should handle zero rows', async () => {
      dbFindAll.mockResolvedValue([])
      const res = await setExpiredMicrochipDeadlineToInBreach()
      expect(res).toBe('Success Microchip Expiry - updated 0 rows')
    })

    test('should handle error', async () => {
      dbFindAll.mockImplementation(() => { throw new Error('dummy error') })
      await expect(setExpiredMicrochipDeadlineToInBreach).rejects.toThrow('dummy error')
    })

    test('should handle some rows given a date prior to deadline expiry', async () => {
      dbFindAll.mockResolvedValue(mockOvernightRowsWithMicrochipDeadline)
      const today = new Date('2024-10-01')
      const res = await setExpiredMicrochipDeadlineToInBreach(today)

      expect(dbFindAll).toHaveBeenCalledWith(undefined, expect.objectContaining({
        where: expect.objectContaining({
          microchip_deadline: {
            [Op.lt]: today
          },
          microchip_verification: {
            [Op.eq]: null
          }
        })
      }))
      expect(res).toBe('Success Microchip Expiry - updated 4 rows')
    })
  })

  describe('addBreachReasonToExpiredMicrochipDeadline', () => {
    test('should handle all rows given date is after expiry', async () => {
      dbFindAll.mockResolvedValue(mockOvernightRowsWithMicrochipDeadline.filter(row => row.dog.status.status === 'In breach'))
      dbFindOne.mockResolvedValue({ id: 16 })
      const today = new Date('2025-01-01')
      const res = await addBreachReasonToExpiredMicrochipDeadline(today)

      expect(dbFindAll).toHaveBeenCalledWith(undefined, expect.objectContaining({
        where: expect.objectContaining({
          microchip_deadline: {
            [Op.lt]: today
          },
          microchip_verification: {
            [Op.eq]: null
          }
        })
      }))
      expect(res).toBe('Success Microchip Expiry add breach reason - updated 2 rows')
    })

    test('should handle some rows given date after for some and before for some', async () => {
      const today = new Date('2024-10-17')
      dbFindAll.mockResolvedValue(mockOvernightRowsWithMicrochipDeadline.filter(row => row.dog.status.status === 'In breach' && new Date(row.dog.exemption.microchip_deadline) < today))
      dbFindOne.mockResolvedValue({ id: 16 })
      const res = await addBreachReasonToExpiredMicrochipDeadline(today)

      expect(dbFindAll).toHaveBeenCalledWith(undefined, expect.objectContaining({
        where: expect.objectContaining({
          microchip_deadline: {
            [Op.lt]: today
          },
          microchip_verification: {
            [Op.eq]: null
          }
        })
      }))
      expect(res).toBe('Success Microchip Expiry add breach reason - updated 1 rows')
    })

    test('should throw if error', async () => {
      dbFindAll.mockResolvedValue(() => { throw new Error('dummy') })
      dbFindOne.mockResolvedValue({ id: 12 })
      const today = new Date('2025-01-01')
      await expect(addBreachReasonToExpiredMicrochipDeadline(today)).rejects.toThrow('Error auto-updating statuses when Microchip Expiry add breach reason: TypeError: addBreachReason is not iterable')
    })
  })
})
