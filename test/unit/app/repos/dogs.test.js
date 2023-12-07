const { breeds: mockBreeds } = require('../../../mocks/dog-breeds')
const mockCdoPayload = require('../../../mocks/cdo/create')

jest.mock('../../../../app/lookups')
const { getBreed } = require('../../../../app/lookups')

describe('Dog repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      dog_breed: {
        findAll: jest.fn()
      },
      dog: {
        findByPk: jest.fn(),
        create: jest.fn()
      },
      registration: {
        findByPk: jest.fn(),
        create: jest.fn()
      },
      registered_person: {
        create: jest.fn()
      }
    },
    transaction: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  const { getBreeds, createDogs } = require('../../../../app/repos/dogs')

  beforeEach(async () => {
    jest.clearAllMocks()

    getBreed.mockResolvedValue({ id: 1, breed: 'Breed 1' })
    sequelize.models.dog_breed.findAll.mockResolvedValue(mockBreeds)
  })

  test('getBreeds should return breeds', async () => {
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

  test('createDogs should create start new transaction if none passed', async () => {
    const enforcement = {
      policeForce: '1',
      court: '1'
    }

    const owners = [{ id: 1, ...mockCdoPayload.owner }]
    const dogs = mockCdoPayload.dogs

    await createDogs(dogs, owners, enforcement)

    expect(sequelize.transaction).toHaveBeenCalledTimes(1)
  })

  test('createDogs should not start new transaction if passed', async () => {
    const mockDog = {
      id: 1,
      breed: 'Breed 1',
      name: 'Dog 1'
    }

    const mockRegistration = {
      id: 1,
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01'
    }

    sequelize.models.dog.create.mockResolvedValue({ ...mockDog })
    sequelize.models.dog.findByPk.mockResolvedValue({ ...mockDog })

    sequelize.models.registration.create.mockResolvedValue({ ...mockRegistration })
    sequelize.models.registration.findByPk.mockResolvedValue({ ...mockRegistration })

    const enforcement = {
      policeForce: '1',
      court: '1'
    }

    const owners = [{ id: 1, ...mockCdoPayload.owner }]
    const dogs = mockCdoPayload.dogs

    await createDogs(dogs, owners, enforcement, {})

    expect(sequelize.transaction).not.toHaveBeenCalled()
  })

  test('createDogs should return created dog / registration', async () => {
    const mockDog = {
      id: 1,
      breed: 'Breed 1',
      name: 'Dog 1'
    }

    const mockRegistration = {
      id: 1,
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01'
    }

    sequelize.models.dog.create.mockResolvedValue({ ...mockDog })
    sequelize.models.dog.findByPk.mockResolvedValue({ ...mockDog })

    sequelize.models.registration.create.mockResolvedValue({ ...mockRegistration })
    sequelize.models.registration.findByPk.mockResolvedValue({ ...mockRegistration })

    const enforcement = {
      policeForce: '1',
      court: '1'
    }

    const owners = [{ id: 1, ...mockCdoPayload.owner }]
    const dogs = [{
      breed: 'Breed 1',
      name: 'Dog 1',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01'
    }]

    const result = await createDogs(dogs, owners, enforcement, {})

    expect(result).toHaveLength(1)
    expect(result).toContainEqual({
      id: 1,
      breed: 'Breed 1',
      name: 'Dog 1',
      registration: {
        id: 1,
        cdoIssued: '2020-01-01',
        cdoExpiry: '2020-02-01'
      }
    })
  })

  test('createDogs should throw if error', async () => {
    sequelize.models.dog.create.mockRejectedValue(new Error('Test error'))

    const enforcement = {
      policeForce: '1',
      court: '1'
    }

    const owners = [{ id: 1, ...mockCdoPayload.owner }]
    const dogs = mockCdoPayload.dogs

    await expect(createDogs(dogs, owners, enforcement, {})).rejects.toThrow('Test error')
  })
})
