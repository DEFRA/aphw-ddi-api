describe('Person Type lookup test', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      person_type: {
        findOne: jest.fn()
      }
    },
    Op: {
      iLike: jest.fn()
    }
  }))

  const sequelize = require('../../../../app/config/db')
  const { Op } = require('sequelize')

  const getPersonType = require('../../../../app/lookups/person-type')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('getPersonType should generate correct where clause', async () => {
    sequelize.models.person_type.findOne.mockResolvedValue({
      id: 2,
      country: 'England'
    })

    const res = await getPersonType('dummy')

    expect(res).toEqual({
      id: 2,
      country: 'England'
    })
    expect(sequelize.models.person_type.findOne.mock.calls[0]).toEqual([{ attributes: ['id'], where: { person_type: { [Op.iLike]: '%dummy%' } } }])
  })
})
