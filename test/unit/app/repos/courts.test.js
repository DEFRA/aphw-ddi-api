const { courts: mockCourts } = require('../../../mocks/courts')
const { payload: mockCdoPayload } = require('../../../mocks/cdo/create')
const { devUser } = require('../../../mocks/auth')

describe('Courts repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn(),
    models: {
      court: {
        findAll: jest.fn(),
        findOne: jest.fn()
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
    const createCourtTransaction = jest.fn()

    afterEach(() => {
      jest.resetAllMocks()
    })

    test('should exist', () => {
      expect(createCourt).toBeInstanceOf(Function)
    })

    test('should create start new transaction if none passed', async () => {
      await createCourt(mockCdoPayload, devUser)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('should create a court', async () => {
      sequelize.models.court.findOne.mockResolvedValue(null)
      const mockCourtPayload = {
        name: 'The Shire County Court'
      }
      await createCourt(mockCourtPayload, devUser, {})

      expect(sequelize.transaction).toHaveBeenCalledTimes(0)
    })

    test('should correctly reject if transaction fails', async () => {
      sequelize.transaction.mockImplementation((autoCallback) => {
        return autoCallback(createCourtTransaction)
      })
      sequelize.models.court.findOne.mockImplementation(async (options) => {
        options.transaction(false)
        throw new Error('error')
      })
      const mockCourtPayload = {}

      await expect(createCourt(mockCourtPayload, devUser)).rejects.toThrow()

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
      expect(createCourtTransaction).toBeCalledWith(false)
    })
  })

  describe('deleteCourt', () => {
    test('should exist', () => {
      expect(deleteCourt).toBeInstanceOf(Function)
    })
  })
})
