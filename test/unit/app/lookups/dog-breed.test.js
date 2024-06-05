describe('Dog Breed lookup test', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      dog_breed: {
        findOne: jest.fn()
      }
    },
    Op: {
      iLike: jest.fn()
    }
  }))

  const sequelize = require('../../../../app/config/db')
  const { Op } = require('sequelize')

  const getBreed = require('../../../../app/lookups/dog-breed')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('getBreed should generate correct where clause', async () => {
    sequelize.models.dog_breed.findOne.mockResolvedValue({
      id: 2,
      country: 'XL Bully'
    })

    const res = await getBreed('dummy')

    expect(res).toEqual({
      id: 2,
      country: 'XL Bully'
    })
    expect(sequelize.models.dog_breed.findOne.mock.calls[0]).toEqual([{ attributes: ['id'], where: { breed: { [Op.iLike]: '%dummy%' } } }])
  })
})
