const { setExpiredNeuteringDeadlineToInBreach, addBreachReasonToExpiredNeuteringDeadline } = require('../../../../app/overnight/expired-neutering-deadline')
const { overnightRows: mockOvernightRows, overnightRowsInBreach: mockOvernightRowsInBreach } = require('../../../mocks/overnight/overnight-rows')

const { dbFindAll, dbFindOne } = require('../../../../app/lib/db-functions')
jest.mock('../../../../app/lib/db-functions')

const { updateStatusOnly } = require('../../../../app/repos/status')
const { Op } = require('sequelize')
const sequelize = require('../../../../app/config/db')

jest.mock('../../../../app/repos/dogs')
const { getCachedStatuses } = require('../../../../app/repos/dogs')
const { statuses: mockStatuses } = require('../../../mocks/statuses')

jest.mock('../../../../app/repos/breaches')
const { getBreachCategories } = require('../../../../app/repos/breaches')
const { BreachCategory } = require('../../../../app/data/domain')

jest.mock('../../../../app/repos/status')

describe('ExpiredNeuteringDeadline test', () => {
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn()
  }))

  const juneDeadlineSwitchedOn = true
  const juneLiteral = juneDeadlineSwitchedOn ? '1 = 1' : '1 = 0'

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

  test('setExpiredNeuteringDeadlineToInBreach should handle zero rows', async () => {
    dbFindAll.mockResolvedValue([])
    const res = await setExpiredNeuteringDeadlineToInBreach()
    expect(res).toBe('Success Neutering Expiry - updated 0 rows')
  })

  test('setExpiredNeuteringDeadlineToInBreach should handle error', async () => {
    dbFindAll.mockImplementation(() => { throw new Error('dummy error') })
    await expect(setExpiredNeuteringDeadlineToInBreach).rejects.toThrow('dummy error')
  })

  test('setExpiredNeuteringDeadlineToInBreach should handle some rows given date is before 2024-07-27', async () => {
    dbFindAll.mockResolvedValue(mockOvernightRows)
    const today = new Date('2024-07-26')
    await setExpiredNeuteringDeadlineToInBreach(today)

    expect(dbFindAll).toHaveBeenCalledWith(undefined, expect.objectContaining({
      where: expect.objectContaining({
        [Op.or]: [
          {
            [Op.and]: [
              {
                neutering_deadline: {
                  [Op.eq]: new Date('2024-06-30')
                }
              },
              sequelize.literal('1 = 0')
            ]
          },
          {
            [Op.and]: [
              {
                neutering_deadline: {
                  [Op.eq]: new Date('2024-12-31')
                }
              },
              sequelize.literal('1 = 0')
            ]
          }
        ]
      })
    }))
  })

  test('setExpiredNeuteringDeadlineToInBreach should handle some rows given date is on 2024-07-27', async () => {
    dbFindAll.mockResolvedValue(mockOvernightRows)
    const today = new Date('2024-07-27')
    await setExpiredNeuteringDeadlineToInBreach(today)

    expect(dbFindAll).toHaveBeenCalledWith(undefined, expect.objectContaining({
      where: expect.objectContaining({
        [Op.or]: [
          {
            [Op.and]: [
              {
                neutering_deadline: {
                  [Op.eq]: new Date('2024-06-30')
                }
              },
              sequelize.literal(juneLiteral)
            ]
          },
          {
            [Op.and]: [
              {
                neutering_deadline: {
                  [Op.eq]: new Date('2024-12-31')
                }
              },
              sequelize.literal('1 = 0')
            ]
          }
        ]
      })
    }))
  })

  test('setExpiredNeuteringDeadlineToInBreach should handle some rows given date is before 2025-01-01', async () => {
    dbFindAll.mockResolvedValue(mockOvernightRows)
    const today = new Date('2024-12-31')
    await setExpiredNeuteringDeadlineToInBreach(today)

    expect(dbFindAll).toHaveBeenCalledWith(undefined, expect.objectContaining({
      where: expect.objectContaining({
        [Op.or]: [
          {
            [Op.and]: [
              {
                neutering_deadline: {
                  [Op.eq]: new Date('2024-06-30')
                }
              },
              sequelize.literal(juneLiteral)
            ]
          },
          {
            [Op.and]: [
              {
                neutering_deadline: {
                  [Op.eq]: new Date('2024-12-31')
                }
              },
              sequelize.literal('1 = 0')
            ]
          }
        ]
      })
    }))
  })

  test('setExpiredNeuteringDeadlineToInBreach should handle some rows given date is on 2025-01-01', async () => {
    dbFindAll.mockResolvedValue(mockOvernightRows)
    const today = new Date('2025-01-01')
    await setExpiredNeuteringDeadlineToInBreach(today)

    expect(dbFindAll).toHaveBeenCalledWith(undefined, expect.objectContaining({
      where: expect.objectContaining({
        [Op.or]: [
          {
            [Op.and]: [
              {
                neutering_deadline: {
                  [Op.eq]: new Date('2024-06-30')
                }
              },
              sequelize.literal(juneLiteral)
            ]
          },
          {
            [Op.and]: [
              {
                neutering_deadline: {
                  [Op.eq]: new Date('2024-12-31')
                }
              },
              sequelize.literal('1 = 1')
            ]
          }
        ]
      })
    }))
  })

  test('setExpiredNeuteringDeadlineToInBreach should handle some rows', async () => {
    dbFindAll.mockResolvedValue(mockOvernightRows)
    const res = await setExpiredNeuteringDeadlineToInBreach()
    expect(res).toBe('Success Neutering Expiry - updated 3 rows')
  })
})
