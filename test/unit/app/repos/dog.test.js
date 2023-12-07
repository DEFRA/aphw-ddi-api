const { breeds: mockBreeds } = require('../../../mocks/dog-breeds')

describe('Dog repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      dog_breed: {
        findAll: jest.fn()
      }
    }
  }))

  const sequelize = require('../../../../app/config/db')

  const { getBreeds } = require('../../../../app/repos/dogs')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('getBreeds should return breeds', async () => {
    sequelize.models.dog_breed.findAll.mockResolvedValue(mockBreeds)

    const breeds = await getBreeds()

    expect(breeds).toHaveLength(3)
    expect(breeds).toContainEqual({ id: 1, breed: 'Breed 1' })
    expect(breeds).toContainEqual({ id: 2, breed: 'Breed 2' })
    expect(breeds).toContainEqual({ id: 3, breed: 'Breed 3' })
  })

  test('getBreeds should throw if error', async () => {
    sequelize.models.dog_breed.findAll.mockRejectedValue(new Error('Test error'))

    await expect(getBreeds()).rejects.toThrow('Test error')
  })
})
