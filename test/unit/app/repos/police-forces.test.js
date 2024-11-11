const { forces: mockForces } = require('../../../mocks/police-forces')
const { devUser } = require('../../../mocks/auth')
const { POLICE } = require('../../../../app/constants/event/audit-event-object-types')
const { DuplicateResourceError } = require('../../../../app/errors/duplicate-record')
const { NotFoundError } = require('../../../../app/errors/not-found')
const { extractShortNameAndDomain } = require('../../../../app/lib/string-helpers')

describe('Police force repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      police_force: {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        destroy: jest.fn(),
        restore: jest.fn()
      }
    },
    transaction: jest.fn(),
    col: jest.fn(),
    fn: jest.fn(),
    where: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  jest.mock('../../../../app/messaging/send-audit')
  const { sendCreateToAudit, sendDeleteToAudit } = require('../../../../app/messaging/send-audit')

  const { getPoliceForces, addForce, deleteForce, getPoliceForceByShortName, lookupPoliceForceByEmail } = require('../../../../app/repos/police-forces')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('getForces', () => {
    sequelize.col.mockReturnValue('name')
    test('getForces should return police forces in alpha sort order', async () => {
      sequelize.models.police_force.findAll.mockResolvedValue(mockForces)

      const forces = await getPoliceForces()

      expect(forces).toHaveLength(3)
      expect(forces).toContainEqual({ id: 3, name: 'Eastern Constabulary', short_name: 'eastern' })
      expect(forces).toContainEqual({ id: 1, name: 'Northern Constabulary', short_name: 'northern' })
      expect(forces).toContainEqual({ id: 2, name: 'Southern Constabulary', short_name: 'southern' })
    })

    test('getForces should throw if error', async () => {
      sequelize.models.police_force.findAll.mockRejectedValue(new Error('Test error'))

      await expect(getPoliceForces()).rejects.toThrow('Test error')
    })
  })

  describe('addForce', () => {
    const mockPoliceForce = {
      name: 'Rohan Police Constabulary'
    }
    test('should create start new transaction if none passed', async () => {
      await addForce(mockPoliceForce, devUser)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('should create a police force', async () => {
      sequelize.models.police_force.findOne.mockResolvedValue(null)

      sequelize.models.police_force.create.mockResolvedValue({
        id: 2,
        name: 'Rohan Police Constabulary'
      })
      const createdPoliceForce = await addForce(mockPoliceForce, devUser, {})

      expect(sequelize.transaction).toHaveBeenCalledTimes(0)
      expect(createdPoliceForce).toEqual({
        id: 2,
        name: 'Rohan Police Constabulary'
      })
      expect(sendCreateToAudit).toHaveBeenCalledWith(POLICE, {
        id: 2,
        name: 'Rohan Police Constabulary'
      }, devUser)
    })

    test('should create a police force given it has been soft deleted', async () => {
      const restoreMock = jest.fn()
      const saveMock = jest.fn()
      sequelize.models.police_force.restore.mockResolvedValue()
      sequelize.models.police_force.findOne.mockResolvedValueOnce(null)
      sequelize.models.police_force.findOne.mockResolvedValueOnce({
        id: 2,
        name: 'Rohan Police Constabulary',
        restore: restoreMock,
        save: saveMock
      })

      const createdPoliceForce = await addForce(mockPoliceForce, devUser, {})

      expect(sequelize.transaction).toHaveBeenCalledTimes(0)
      expect(createdPoliceForce).toEqual({
        id: 2,
        name: 'Rohan Police Constabulary',
        restore: expect.any(Function),
        save: expect.any(Function)
      })
      expect(sequelize.models.police_force.create).not.toHaveBeenCalled()
      expect(sendCreateToAudit).toHaveBeenCalledWith(POLICE, {
        id: 2,
        name: 'Rohan Police Constabulary'
      }, devUser)
      expect(restoreMock).toHaveBeenCalled()
      expect(saveMock).toHaveBeenCalled()
    })

    test('should throw a DuplicateRecordError given police already exists', async () => {
      sequelize.models.police_force.findOne.mockResolvedValue({
        id: 5,
        name: 'Rohan Police Constabulary'
      })
      const mockPoliceForcePayload = {
        name: 'Rohan Police Constabulary'
      }
      await expect(addForce(mockPoliceForcePayload, devUser, {})).rejects.toThrow(new DuplicateResourceError('Police Force with name Rohan Police Constabulary is already listed'))
    })

    test('should correctly reject if transaction fails', async () => {
      sequelize.models.police_force.findOne.mockResolvedValue(null)
      const addForceTransaction = jest.fn()
      sequelize.transaction.mockImplementation(async (autoCallback) => {
        return autoCallback(addForceTransaction)
      })
      sequelize.models.police_force.create.mockImplementation(async (_police, options) => {
        options.transaction(false)
      })
      sendCreateToAudit.mockRejectedValue()

      const mockPoliceForcePayload = {}

      await expect(addForce(mockPoliceForcePayload, devUser)).rejects.toThrow()

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
      expect(addForceTransaction).toHaveBeenCalledWith(false)
    })
  })

  describe('deleteForce', () => {
    test('should create start new transaction if none passed', async () => {
      sequelize.models.police_force.findOne.mockResolvedValueOnce({
        id: 2,
        name: 'Rohan Police Constabulary'
      })
      await deleteForce(2, devUser)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('should delete the police force', async () => {
      sequelize.models.police_force.findOne.mockResolvedValue({
        id: 5,
        name: 'The Shire Constabulary'
      })
      sequelize.models.police_force.destroy.mockResolvedValue(5)
      await deleteForce(2, devUser, {})
      expect(sequelize.models.police_force.destroy).toHaveBeenCalled()
      expect(sendDeleteToAudit).toHaveBeenCalledWith(POLICE, {
        id: 5,
        name: 'The Shire Constabulary'
      }, devUser)
    })

    test('should throw a NotFound given police force id does not exist', async () => {
      sequelize.models.police_force.findOne.mockResolvedValue(null)

      await expect(deleteForce(2, devUser, {})).rejects.toThrow(new NotFoundError('Police Force with id 2 does not exist'))
    })
  })

  describe('getPoliceForceByShortName', () => {
    test('should get police force by short name', async () => {
      const shortName = 'rohan-police'

      sequelize.models.police_force.findOne.mockResolvedValueOnce({
        id: 2,
        name: 'Rohan Police Constabulary',
        short_name: shortName
      })

      const policeForce = await getPoliceForceByShortName(shortName, {})
      expect(policeForce).toEqual({
        id: 2,
        name: 'Rohan Police Constabulary',
        short_name: shortName
      })
      expect(sequelize.models.police_force.findOne).toHaveBeenCalledWith({
        where: {
          short_name: shortName
        },
        transaction: {}
      })
    })

    test('should return null if police force does not exist when searched by domain', async () => {
      sequelize.models.police_force.findOne.mockResolvedValueOnce(null)

      const domain = 'example.com'

      const policeForce = await getPoliceForceByShortName(domain, {})
      expect(policeForce).toBeNull()
    })
  })

  describe('lookupPoliceForceByEmail', () => {
    test('should get police force by email', async () => {
      const shortName = 'short-police-name'

      sequelize.models.police_force.findOne.mockResolvedValueOnce({
        id: 2,
        name: 'Rohan Police Constabulary',
        short_name: shortName
      })

      const policeForce = await lookupPoliceForceByEmail('some-email@short-police-name.police.uk')
      expect(policeForce).toEqual('Rohan Police Constabulary')
      expect(sequelize.models.police_force.findOne).toHaveBeenCalledWith({
        where: {
          short_name: shortName
        },
        transaction: undefined
      })
    })

    test('should return domain if police force does not exist when searched by domain', async () => {
      sequelize.models.police_force.findOne.mockResolvedValueOnce(null)

      const policeForce = await lookupPoliceForceByEmail('some-email@bad-domain.police.uk', {})
      expect(policeForce).toBe('bad-domain.police.uk')
    })
  })

  describe('extractShortNameAndDomain', () => {
    test('should get domain and shortName', async () => {
      const { domain, shortName } = extractShortNameAndDomain('some-email@abc.police.uk')
      expect(domain).toBe('abc.police.uk')
      expect(shortName).toBe('abc')
    })

    test('should get domain and shortName', async () => {
      const { domain, shortName } = extractShortNameAndDomain('some-email@abc.pnn.police.uk')
      expect(domain).toBe('abc.pnn.police.uk')
      expect(shortName).toBe('abc')
    })

    test('should handle null email', async () => {
      const { domain, shortName } = extractShortNameAndDomain(null)
      expect(domain).toBe(null)
      expect(shortName).toBe('unknown')
    })

    test('should handle undefined email', async () => {
      const { domain, shortName } = extractShortNameAndDomain(undefined)
      expect(domain).toBe(undefined)
      expect(shortName).toBe('unknown')
    })

    test('should handle email with no @', async () => {
      const { domain, shortName } = extractShortNameAndDomain('bad-email')
      expect(domain).toBe('bad-email')
      expect(shortName).toBe('unknown')
    })
  })
})
