describe('Country lookup test', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      country: {
        findOne: jest.fn()
      }
    },
    Op: {
      iLike: jest.fn()
    }
  }))

  const sequelize = require('../../../../app/config/db')
  const { Op } = require('sequelize')

  const getCountry = require('../../../../app/lookups/country')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('getCountry should generate correct where clause', async () => {
    sequelize.models.country.findOne.mockResolvedValue({
      id: 2,
      country: 'England'
    })

    const res = await getCountry('dummy')

    expect(res).toEqual({
      id: 2,
      country: 'England'
    })
    expect(sequelize.models.country.findOne.mock.calls[0]).toEqual([{ attributes: ['id'], where: { country: { [Op.iLike]: '%dummy%' } } }])
  })
})
