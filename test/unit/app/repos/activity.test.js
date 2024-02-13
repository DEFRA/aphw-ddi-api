const { activities: mockActivities } = require('../../../mocks/activities')

describe('Activity repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      activity: {
        findAll: jest.fn(),
        findOne: jest.fn()
      }
    },
    col: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  const { getActivityList, getActivityById } = require('../../../../app/repos/activity')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('getActivityList should return activities', async () => {
    sequelize.models.activity.findAll.mockResolvedValue(mockActivities)

    const activities = await getActivityList('sent', 'dog')

    expect(activities).toHaveLength(3)
    expect(activities).toStrictEqual([
      { id: 1, name: 'act 1', display_order: 1 },
      { id: 2, name: 'act 2', display_order: 2 },
      { id: 3, name: 'act 3', display_order: 3 }
    ])
  })

  test('getActivityList should throw if error', async () => {
    sequelize.models.activity.findAll.mockRejectedValue(new Error('Test error'))

    await expect(getActivityList('sent', 'dog')).rejects.toThrow('Test error')
  })

  test('getActivityById should return activity', async () => {
    sequelize.models.activity.findOne.mockResolvedValue(mockActivities[1])

    const activity = await getActivityById(2)

    expect(activity).toEqual({ id: 2, name: 'act 2', display_order: 2 })
  })

  test('getActivityById should throw if error', async () => {
    sequelize.models.activity.findOne.mockRejectedValue(new Error('Test error'))

    await expect(getActivityById(2)).rejects.toThrow('Test error')
  })
})
