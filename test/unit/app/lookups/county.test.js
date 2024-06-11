describe('County lookup test', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      county: {
        findOne: jest.fn()
      }
    },
    Op: {
      iLike: jest.fn()
    }
  }))

  const sequelize = require('../../../../app/config/db')
  const { Op } = require('sequelize')

  const getCounty = require('../../../../app/lookups/county')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('getCounty should generate correct where clause', async () => {
    sequelize.models.county.findOne.mockResolvedValue({
      id: 2,
      country: 'North Yorkshire'
    })

    const res = await getCounty('dummy')

    expect(res).toEqual({
      id: 2,
      country: 'North Yorkshire'
    })
    expect(sequelize.models.county.findOne.mock.calls[0]).toEqual([{ attributes: ['id'], where: { county: { [Op.iLike]: '%dummy%' } } }])
  })
})
