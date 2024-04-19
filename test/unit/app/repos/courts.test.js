const { courts: mockCourts } = require('../../../mocks/courts')
const { devUser } = require('../../../mocks/auth')
const { DuplicateResourceError } = require('../../../../app/errors/duplicate-record')
const { COURT } = require('../../../../app/constants/event/audit-event-object-types')

describe('Courts repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn(),
    models: {
      court: {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn()
      }
    }
  }))

  jest.mock('../../../../app/messaging/send-audit')
  const { sendCreateToAudit } = require('../../../../app/messaging/send-audit')

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
    const mockCourtPayload = {
      name: 'The Shire County Court'
    }
    test('should create start new transaction if none passed', async () => {
      await createCourt(mockCourtPayload, devUser)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('should create a court', async () => {
      sequelize.models.court.findOne.mockResolvedValue(null)

      sequelize.models.court.create.mockResolvedValue({
        id: 2,
        name: 'The Shire County Court'
      })
      const createdCourt = await createCourt(mockCourtPayload, devUser, {})

      expect(sequelize.transaction).toHaveBeenCalledTimes(0)
      expect(createdCourt).toEqual({
        id: 2,
        name: 'The Shire County Court'
      })
      expect(sendCreateToAudit).toBeCalledWith(COURT, {
        id: 2,
        name: 'The Shire County Court'
      }, devUser)
    })

    test('should throw a DuplicatRecordError given court already exists', async () => {
      sequelize.models.court.findOne.mockResolvedValue({
        id: 5,
        name: 'The Shire County Court'
      })
      const mockCourtPayload = {
        name: 'The Shire County Court'
      }
      await expect(createCourt(mockCourtPayload, devUser, {})).rejects.toThrow(new DuplicateResourceError('Court with name The Shire County Court already exists'))
    })

    test('should correctly reject if transaction fails', async () => {
      const createCourtTransaction = jest.fn()

      sequelize.transaction.mockImplementation(async (autoCallback) => {
        return autoCallback(createCourtTransaction)
      })
      sequelize.models.court.findOne.mockImplementation(async (query, options) => {
        options.transaction(false)
        throw new Error('error')
      })
      const mockCourtPayload = {}

      await expect(createCourt(mockCourtPayload, devUser)).rejects.toThrow()

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
      expect(sequelize.models.court.create).not.toHaveBeenCalled()
      expect(createCourtTransaction).toBeCalledWith(false)
    })
  })

  describe('deleteCourt', () => {
    test('should exist', () => {
      expect(deleteCourt).toBeInstanceOf(Function)
    })
  })
})
