const { courts: mockCourts } = require('../../../mocks/courts')
const sequelize = require('../../../../app/config/db')
const { getCourts } = require('../../../../app/repos/courts')

describe('Courts repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      court: {
        findAll: jest.fn()
      }
    }
  }))

  const sequelize = require('../../../../app/config/db')

  const { getCourts, createCourt, deleteCourt } = require('../../../../app/repos/courts')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('getCourts', () => {
    test('should return courts', async () => {
      sequelize.models.court.findAll.mockResolvedValue(mockCourts)

      const courts = await getCourts()

      expect(courts).toHaveLength(3)
      expect(courts).toContainEqual({ id: 1, name: 'Horsham Law Courts' })
      expect(courts).toContainEqual({ id: 2, name: 'Maidstone Magistrates\' Courts' })
      expect(courts).toContainEqual({ id: 3, name: 'North Somerset Courthouse' })
    })

    test('should throw if error', async () => {
      sequelize.models.court.findAll.mockRejectedValue(new Error('Test error'))

      await expect(getCourts()).rejects.toThrow('Test error')
    })
  })

  describe('createCourt', () => {
    test('should exist', () => {
      expect(createCourt).toBeInstanceOf(Function)
    })
  })

  describe('deleteCourt', () => {
    test('should exist', () => {
      expect(deleteCourt).toBeInstanceOf(Function)
    })
  })
})
