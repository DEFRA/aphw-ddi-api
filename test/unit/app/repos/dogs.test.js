const { breeds: mockBreeds } = require('../../../mocks/dog-breeds')
const { statuses: mockStatuses } = require('../../../mocks/statuses')
const mockCdoPayload = require('../../../mocks/cdo/create')

jest.mock('../../../../app/lookups')
const { getBreed, getExemptionOrder } = require('../../../../app/lookups')

describe('Dog repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      dog_breed: {
        findAll: jest.fn()
      },
      dog: {
        findByPk: jest.fn(),
        create: jest.fn(),
        findOne: jest.fn(),
        findAll: jest.fn()
      },
      registration: {
        findByPk: jest.fn(),
        create: jest.fn()
      },
      registered_person: {
        create: jest.fn()
      },
      microchip: {
        findAll: jest.fn(),
        create: jest.fn()
      },
      dog_microchip: {
        findAll: jest.fn(),
        create: jest.fn()
      },
      status: {
        findAll: jest.fn()
      }
    },
    col: jest.fn(),
    transaction: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  const { getBreeds, getStatuses, createDogs, addImportedDog, getDogByIndexNumber, getAllDogIds, updateDogFields, updateMicrochips } = require('../../../../app/repos/dogs')

  beforeEach(async () => {
    jest.clearAllMocks()

    getBreed.mockResolvedValue({ id: 1, breed: 'Breed 1' })
    getExemptionOrder.mockResolvedValue({ id: 1, exemption_order: '2015' })
    sequelize.models.dog_breed.findAll.mockResolvedValue(mockBreeds)
    sequelize.models.status.findAll.mockResolvedValue(mockStatuses)
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

  test('getStatuses should return statuses', async () => {
    const statuses = await getStatuses()

    expect(statuses).toHaveLength(3)
    expect(statuses).toContainEqual({ id: 1, status: 'Status 1' })
    expect(statuses).toContainEqual({ id: 2, status: 'Status 2' })
    expect(statuses).toContainEqual({ id: 3, status: 'Status 3' })
  })

  test('getStatuses should throw if error', async () => {
    sequelize.models.status.findAll.mockRejectedValue(new Error('Test error'))

    await expect(getStatuses()).rejects.toThrow('Test error')
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

  test('addImportedDog should create new transaction if none passed', async () => {
    sequelize.models.dog.create.mockResolvedValue({ id: 123, breed: 'breed', name: 'Bruno' })

    const dog = {
      id: 123,
      name: 'Bruno',
      owner: { firstName: 'John', lastName: 'Smith' }
    }

    await addImportedDog(dog)
    expect(sequelize.transaction).toHaveBeenCalledTimes(1)
  })

  test('addImportedDog should create dog', async () => {
    sequelize.models.dog.create.mockResolvedValue({ id: 123, breed: 'breed', name: 'Bruno' })

    const dog = {
      id: 123,
      name: 'Bruno',
      owner: { firstName: 'John', lastName: 'Smith' }
    }

    await addImportedDog(dog, {})
    expect(sequelize.models.dog.create).toHaveBeenCalledTimes(1)
    expect(sequelize.models.registered_person.create).toHaveBeenCalledTimes(1)
    expect(sequelize.transaction).toHaveBeenCalledTimes(0)
  })

  test('getDogByIndexNumber should return dog', async () => {
    sequelize.models.dog.findOne.mockResolvedValue({ id: 123, breed: 'breed', name: 'Bruno' })

    const res = await getDogByIndexNumber('ED123')
    expect(sequelize.models.dog.findOne).toHaveBeenCalledTimes(1)
    expect(res).not.toBe(null)
    expect(res.id).toBe(123)
  })

  test('getAllDogIds should return dog ids', async () => {
    sequelize.models.dog.findAll.mockResolvedValue([123, 456])

    const res = await getAllDogIds()
    expect(sequelize.models.dog.findAll).toHaveBeenCalledTimes(1)
    expect(res).not.toBe(null)
    expect(res.length).toBe(2)
    expect(res[0]).toBe(123)
    expect(res[1]).toBe(456)
  })

  test('updateDogFields should update fields', () => {
    const dbDog = {}
    const breeds = [
      { breed: 'breed1', id: 123 }
    ]
    const payload = {
      breed: 'breed1',
      name: 'dog name',
      dateOfBirth: new Date(2000, 1, 1),
      dateOfDeath: new Date(2015, 2, 2),
      tattoo: 'tattoo',
      colour: 'colour',
      sex: 'Male',
      dateExported: new Date(2018, 3, 3),
      dateStolen: new Date(2019, 4, 4)
    }
    updateDogFields(dbDog, payload, breeds)
    expect(dbDog.dog_breed_id).toBe(123)
    expect(dbDog.name).toBe('dog name')
    expect(dbDog.birth_date).toEqual(new Date(2000, 1, 1))
    expect(dbDog.death_date).toEqual(new Date(2015, 2, 2))
    expect(dbDog.tattoo).toBe('tattoo')
    expect(dbDog.colour).toBe('colour')
    expect(dbDog.sex).toBe('Male')
    expect(dbDog.exported_date).toEqual(new Date(2018, 3, 3))
    expect(dbDog.stolen_date).toEqual(new Date(2019, 4, 4))
  })

  test('updateMicrochips should update existing', async () => {
    const mockSave = jest.fn()
    sequelize.models.microchip.findAll.mockResolvedValue([{ microchip_number: '123', save: mockSave }])

    const dogFromDb = {
      id: 1
    }
    const payload = {
      microchipNumber: '456'
    }
    await updateMicrochips(dogFromDb, payload, {})
    expect(mockSave).toHaveBeenCalledTimes(1)
  })

  test('updateMicrochips should create new if not existing', async () => {
    const mockSave = jest.fn()
    sequelize.models.microchip.findAll.mockResolvedValue([])
    sequelize.models.microchip.create.mockResolvedValue({ id: 101 })

    const dogFromDb = {
      id: 1
    }
    const payload = {
      microchipNumber: '456'
    }
    await updateMicrochips(dogFromDb, payload, {})
    expect(mockSave).toHaveBeenCalledTimes(0)
    expect(sequelize.models.microchip.create).toHaveBeenCalledTimes(1)
  })
})
