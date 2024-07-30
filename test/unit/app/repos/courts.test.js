const { courts: mockCourts } = require('../../../mocks/courts')
const { devUser } = require('../../../mocks/auth')
const { DuplicateResourceError } = require('../../../../app/errors/duplicate-record')
const { COURT } = require('../../../../app/constants/event/audit-event-object-types')
const { NotFoundError } = require('../../../../app/errors/not-found')

describe('Courts repo', () => {
  const mockTransaction = jest.fn()
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn().mockImplementation(async (fn) => {
      return await fn(mockTransaction)
    }),
    col: jest.fn(),
    fn: jest.fn(),
    where: jest.fn(),
    models: {
      court: {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        destroy: jest.fn(),
        restore: jest.fn()
      }
    }
  }))

  jest.mock('../../../../app/messaging/send-audit')
  const { sendCreateToAudit, sendDeleteToAudit } = require('../../../../app/messaging/send-audit')

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
      expect(sequelize.col).toHaveBeenCalledWith('name')
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
      sequelize.models.court.findOne.mockResolvedValue(null)

      sequelize.models.court.create.mockResolvedValue({
        id: 2,
        name: 'The Shire County Court'
      })

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
      expect(sendCreateToAudit).toHaveBeenCalledWith(COURT, {
        id: 2,
        name: 'The Shire County Court'
      }, devUser)
    })

    test('should create a court given it has been soft deleted', async () => {
      const saveMock = jest.fn()
      const restoreMock = jest.fn()
      sequelize.models.court.restore.mockResolvedValue()
      sequelize.models.court.findOne.mockResolvedValueOnce(null)
      sequelize.models.court.findOne.mockResolvedValueOnce({
        id: 2,
        name: 'The Shire County Court',
        save: saveMock,
        restore: restoreMock
      })

      const createdCourt = await createCourt(mockCourtPayload, devUser, {})

      expect(sequelize.transaction).toHaveBeenCalledTimes(0)
      expect(createdCourt).toEqual({
        id: 2,
        name: 'The Shire County Court',
        save: expect.any(Function),
        restore: expect.any(Function)
      })
      expect(saveMock).toHaveBeenCalled()
      expect(restoreMock).toHaveBeenCalled()
      expect(sequelize.models.court.create).not.toHaveBeenCalled()
      expect(sendCreateToAudit).toHaveBeenCalledWith(COURT, {
        id: 2,
        name: 'The Shire County Court'
      }, devUser)
    })

    test('should throw a DuplicateRecordError given court already exists', async () => {
      sequelize.models.court.findOne.mockResolvedValue({
        id: 5,
        name: 'The Shire County Court'
      })
      const mockCourtPayload = {
        name: 'The Shire County Court'
      }
      await expect(createCourt(mockCourtPayload, devUser, {})).rejects.toThrow(new DuplicateResourceError('Court with name The Shire County Court is already listed'))
    })

    test('should correctly reject if transaction fails', async () => {
      sequelize.models.court.findOne.mockResolvedValue(null)
      const createCourtTransaction = jest.fn()
      sequelize.transaction.mockImplementation(async (autoCallback) => {
        return autoCallback(createCourtTransaction)
      })
      sequelize.models.court.create.mockImplementation(async (_court, options) => {
        options.transaction(false)
      })
      sendCreateToAudit.mockRejectedValue()

      const mockCourtPayload = {}

      await expect(createCourt(mockCourtPayload, devUser)).rejects.toThrow()

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
      expect(createCourtTransaction).toHaveBeenCalledWith(false)
    })
  })

  describe('deleteCourt', () => {
    test('should create start new transaction if none passed', async () => {
      sequelize.models.court.findOne.mockResolvedValue({
        id: 5,
        name: 'The Shire County Court'
      })
      sequelize.models.court.destroy.mockResolvedValue(5)

      await deleteCourt(2, devUser)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('should delete the court', async () => {
      sequelize.models.court.findOne.mockResolvedValue({
        id: 5,
        name: 'The Shire County Court'
      })
      sequelize.models.court.destroy.mockResolvedValue(5)
      await deleteCourt(2, devUser, {})
      expect(sequelize.models.court.destroy).toHaveBeenCalled()
      expect(sendDeleteToAudit).toHaveBeenCalledWith(COURT, {
        id: 5,
        name: 'The Shire County Court'
      }, devUser)
    })

    test('should throw a NotFound given court id does not exist', async () => {
      sequelize.models.court.findOne.mockResolvedValue(null)

      await expect(deleteCourt(2, devUser, {})).rejects.toThrow(new NotFoundError('Court with id 2 does not exist'))
    })
  })
})
