const { forces: mockForces } = require('../../../mocks/police-forces')

describe('Police force repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      police_force: {
        findAll: jest.fn()
      }
    }
  }))

  const sequelize = require('../../../../app/config/db')

  const { getForces } = require('../../../../app/repos/police-forces')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('getForces should return police forces', async () => {
    sequelize.models.police_force.findAll.mockResolvedValue(mockForces)

    const forces = await getForces()

    expect(forces).toHaveLength(3)
    expect(forces).toContainEqual({ id: 1, name: 'Northern Constabulary' })
    expect(forces).toContainEqual({ id: 2, name: 'Southern Constabulary' })
    expect(forces).toContainEqual({ id: 3, name: 'Eastern Constabulary' })
  })

  test('getForces should throw if error', async () => {
    sequelize.models.police_force.findAll.mockRejectedValue(new Error('Test error'))

    await expect(getForces()).rejects.toThrow('Test error')
  })
})
