describe('Police Force lookup test', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      police_force: {
        findOne: jest.fn()
      }
    },
    Op: {
      iLike: jest.fn()
    }
  }))

  const sequelize = require('../../../../app/config/db')
  const { Op } = require('sequelize')

  const getPoliceForce = require('../../../../app/lookups/police-force')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('getPoliceForce should generate correct where clause', async () => {
    sequelize.models.police_force.findOne.mockResolvedValue({
      id: 2,
      country: 'Police Force 1'
    })

    const res = await getPoliceForce('dummy')

    expect(res).toEqual({
      id: 2,
      country: 'Police Force 1'
    })
    expect(sequelize.models.police_force.findOne.mock.calls[0]).toEqual([{ attributes: ['id'], where: { name: { [Op.iLike]: '%dummy%' } } }])
  })
})
