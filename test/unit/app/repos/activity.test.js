const { activities: mockActivities } = require('../../../mocks/activities')
const { devUser } = require('../../../mocks/auth')

describe('Activity repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      activity: {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        destroy: jest.fn()
      },
      activity_source: {
        findOne: jest.fn()
      },
      activity_type: {
        findOne: jest.fn()
      }
    },
    col: jest.fn(),
    fn: jest.fn(),
    transaction: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  jest.mock('../../../../app/messaging/send-audit')
  const { sendCreateToAudit, sendDeleteToAudit } = require('../../../../app/messaging/send-audit')

  const { getActivityList, getActivityById, createActivity, deleteActivity, getActivityByLabel } = require('../../../../app/repos/activity')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('getActivityList', () => {
    test('should return activities', async () => {
      sequelize.models.activity.findAll.mockResolvedValue(mockActivities)

      const activities = await getActivityList('sent', 'dog')

      expect(activities).toHaveLength(3)
      expect(activities).toStrictEqual([
        { id: 1, label: 'act 1', display_order: 1 },
        { id: 2, label: 'act 2', display_order: 2 },
        { id: 3, label: 'act 3', display_order: 3 }
      ])
    })

    test('should throw if error', async () => {
      sequelize.models.activity.findAll.mockRejectedValue(new Error('Test error'))

      await expect(getActivityList('sent', 'dog')).rejects.toThrow('Test error')
    })
  })

  describe('getActivityById', () => {
    test('should return activity', async () => {
      sequelize.models.activity.findOne.mockResolvedValue(mockActivities[1])

      const activity = await getActivityById(2)

      expect(activity).toEqual({ id: 2, label: 'act 2', display_order: 2 })
    })

    test('should throw if error', async () => {
      sequelize.models.activity.findOne.mockRejectedValue(new Error('Test error'))

      await expect(getActivityById(2)).rejects.toThrow('Test error')
    })
  })

  describe('getActivityByLabel', () => {
    test('should return activity', async () => {
      sequelize.models.activity.findOne.mockResolvedValue(mockActivities[1])

      const activity = await getActivityByLabel('act 2')

      expect(activity).toEqual({ id: 2, label: 'act 2', display_order: 2 })
    })

    test('should throw if error', async () => {
      sequelize.models.activity.findOne.mockRejectedValue(new Error('Test error'))

      await expect(getActivityByLabel('Application pack')).rejects.toThrow('Test error')
    })
  })

  describe('createActivity', () => {
    test('should create new transaction if none passed', async () => {
      await createActivity({
        label: 'New activity 1',
        activitySource: 'dog',
        activityType: 'sent'
      }, devUser)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('should create an activity if not already exists', async () => {
      const expectedActivity = { id: 22, label: 'New activity 1', activitySource: 'dog', activityType: 'sent' }

      sequelize.models.activity_type.findOne.mockResolvedValue({ id: 5 })
      sequelize.models.activity_source.findOne.mockResolvedValue({ id: 7 })
      sequelize.models.activity.findAll.mockResolvedValue([])
      sequelize.models.activity.create.mockResolvedValue({
        id: 22,
        label: 'New activity 1',
        activity_source_id: 7,
        activity_type_id: 5
      })

      const activity = await createActivity({
        label: 'New activity 1',
        activitySource: 'dog',
        activityType: 'sent'
      }, devUser, {})

      expect(activity).toEqual(expectedActivity)
      expect(sequelize.models.activity.create).toHaveBeenCalledWith({
        label: 'New activity 1',
        activity_source_id: 7,
        activity_type_id: 5,
        activity_event_id: 7,
        display_order: 10
      }, expect.anything())
      expect(sendCreateToAudit).toHaveBeenCalledWith('activity', expectedActivity, devUser)
    })

    test('should throw if already exists', async () => {
      sequelize.models.activity_type.findOne.mockResolvedValue({ id: 5 })
      sequelize.models.activity_source.findOne.mockResolvedValue({ id: 7 })
      sequelize.models.activity.findAll.mockResolvedValue([{ label: 'Existing' }])
      sequelize.models.activity.create.mockResolvedValue()

      await expect(
        createActivity({
          label: 'existing',
          activitySource: 'dog',
          activityType: 'sent'
        }, devUser, {})).rejects.toThrow('Activity with name existing already exists for type sent and source dog')

      expect(sequelize.models.activity.create).not.toHaveBeenCalled()
      expect(sendCreateToAudit).not.toHaveBeenCalled()
    })
  })

  describe('deleteActivity', () => {
    test('should create new transaction if none passed', async () => {
      await deleteActivity(123, devUser)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('should delete an activity if exists', async () => {
      sequelize.models.activity.findOne.mockResolvedValue({ label: 'found' })
      sequelize.models.activity.destroy.mockResolvedValue()

      await deleteActivity(123, devUser, {})

      expect(sequelize.models.activity.destroy).toHaveBeenCalledTimes(1)
      expect(sendDeleteToAudit).toHaveBeenCalledWith('activity', { label: 'found' }, devUser)
    })

    test('should throw if doesnt exist', async () => {
      sequelize.models.activity.findOne.mockResolvedValue(null)
      sequelize.models.activity.destroy.mockResolvedValue()

      await expect(deleteActivity(123, devUser, {})).rejects.toThrow('Activity with id 123 does not exist')

      expect(sequelize.models.activity.destroy).not.toHaveBeenCalled()
      expect(sendDeleteToAudit).not.toHaveBeenCalled()
    })
  })
})
