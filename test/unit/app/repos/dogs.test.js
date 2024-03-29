const { breeds: mockBreeds } = require('../../../mocks/dog-breeds')
const { statuses: mockStatuses } = require('../../../mocks/statuses')
const { payload: mockCdoPayload } = require('../../../mocks/cdo/create')

jest.mock('../../../../app/repos/insurance')
const { createInsurance } = require('../../../../app/repos/insurance')

jest.mock('../../../../app/lookups')
const { getBreed, getExemptionOrder } = require('../../../../app/lookups')

jest.mock('../../../../app/messaging/send-event')
const { sendEvent } = require('../../../../app/messaging/send-event')

const devUser = {
  username: 'dev-user@test.com',
  displayname: 'Dev User'
}

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
        create: jest.fn(),
        destroy: jest.fn()
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
      },
      search_index: {
        findAll: jest.fn(),
        save: jest.fn()
      }
    },
    col: jest.fn(),
    transaction: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  const { getBreeds, getStatuses, createDogs, addImportedDog, getDogByIndexNumber, getAllDogIds, updateDog, updateStatus, updateDogFields, updateMicrochips } = require('../../../../app/repos/dogs')

  beforeEach(async () => {
    jest.clearAllMocks()

    getBreed.mockResolvedValue({ id: 1, breed: 'Breed 1' })
    getExemptionOrder.mockResolvedValue({ id: 1, exemption_order: '2015' })
    sequelize.models.dog_breed.findAll.mockResolvedValue(mockBreeds)
    sequelize.models.status.findAll.mockResolvedValue(mockStatuses)
    createInsurance.mockResolvedValue()
    sendEvent.mockResolvedValue()
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

    expect(statuses).toHaveLength(7)
    expect(statuses).toContainEqual({ id: 1, status: 'Interim exempt' })
    expect(statuses).toContainEqual({ id: 2, status: 'Pre-exempt' })
    expect(statuses).toContainEqual({ id: 3, status: 'Exempt' })
    expect(statuses).toContainEqual({ id: 7, status: 'Inactive' })
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
      cdoExpiry: '2020-02-01',
      status: 'Status 1'
    }]

    const result = await createDogs(dogs, owners, enforcement, {})

    expect(result).toHaveLength(1)
    expect(result).toContainEqual({
      id: 1,
      breed: 'Breed 1',
      name: 'Dog 1',
      existingDog: false,
      registration: {
        id: 1,
        cdoIssued: '2020-01-01',
        cdoExpiry: '2020-02-01'
      }
    })
  })

  test('createDogs should handle microchip and source and insurance', async () => {
    const mockDog = {
      id: 1,
      breed: 'Breed 1',
      name: 'Dog 1',
      microchipNumber: 123456789012345,
      source: 'ROBOT'
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

    sequelize.models.microchip.create.mockResolvedValue({ id: 456 })

    const enforcement = {
      policeForce: '1',
      court: '1'
    }

    const owners = [{ id: 1, ...mockCdoPayload.owner }]
    const dogs = [{
      breed: 'Breed 1',
      name: 'Dog 1',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01',
      status: 'Status 1',
      microchipNumber: 123456789012345,
      source: 'ROBOT',
      insurance: {
        company_name: 'Dog Insurers'
      }
    }]

    const result = await createDogs(dogs, owners, enforcement, {})

    expect(result).toHaveLength(1)
    expect(result).toContainEqual({
      id: 1,
      breed: 'Breed 1',
      name: 'Dog 1',
      existingDog: false,
      microchipNumber: 123456789012345,
      registration: {
        id: 1,
        cdoIssued: '2020-01-01',
        cdoExpiry: '2020-02-01'
      },
      source: 'ROBOT'
    })
  })

  test('createDogs should handle no microchip and source and insurance', async () => {
    const mockDog = {
      id: 1,
      breed: 'Breed 1',
      name: 'Dog 1',
      source: 'ROBOT'
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

    sequelize.models.microchip.create.mockResolvedValue({ id: 456 })

    const enforcement = {
      policeForce: '1',
      court: '1'
    }

    const owners = [{ id: 1, ...mockCdoPayload.owner }]
    const dogs = [{
      breed: 'Breed 1',
      name: 'Dog 1',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01',
      status: 'Status 1',
      source: 'ROBOT',
      insurance: {
        company_name: 'Dog Insurers'
      }
    }]

    const result = await createDogs(dogs, owners, enforcement, {})

    expect(result).toHaveLength(1)
    expect(result).toContainEqual({
      id: 1,
      breed: 'Breed 1',
      name: 'Dog 1',
      existingDog: false,
      registration: {
        id: 1,
        cdoIssued: '2020-01-01',
        cdoExpiry: '2020-02-01'
      },
      source: 'ROBOT'
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

  test('createDogs should return existing dog / registration', async () => {
    const dogSave = jest.fn()

    const mockExistingDog = {
      id: 1,
      breed: 'Breed 1',
      name: 'Dog 1',
      indexNumber: 'ED1',
      save: dogSave
    }

    const mockRegistration = {
      id: 1,
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01'
    }

    sequelize.models.dog.findOne.mockResolvedValue(mockExistingDog)
    sequelize.models.dog.findByPk.mockResolvedValue(mockExistingDog)

    sequelize.models.registration.findByPk.mockResolvedValue(mockRegistration)
    sequelize.models.registration.create.mockResolvedValue({ id: 123 })

    const enforcement = {
      policeForce: '1',
      court: '1'
    }

    const owners = [{ id: 1, ...mockCdoPayload.owner }]
    const dogs = [{
      breed: 'Breed 1',
      name: 'Dog 1',
      indexNumber: 'ED1',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01',
      status: 'Status 1',
      source: 'UI',
      microchipNumber: '12345'
    }]

    const result = await createDogs(dogs, owners, enforcement, {})

    expect(result).toHaveLength(1)

    expect(sequelize.models.dog.create).not.toHaveBeenCalled()
    expect(dogSave).toHaveBeenCalledTimes(1)
    expect(sequelize.models.registration.destroy).toHaveBeenCalledTimes(1)
    expect(sequelize.models.registration.create).toHaveBeenCalledTimes(1)

    delete result[0].save

    expect(result).toContainEqual({
      id: 1,
      breed: 'Breed 1',
      name: 'Dog 1',
      existingDog: true,
      indexNumber: 'ED1',
      microchipNumber: '12345',
      registration: {
        id: 1,
        cdoIssued: '2020-01-01',
        cdoExpiry: '2020-02-01'
      },
      status_id: 2
    })
  })

  test('addImportedDog should create new transaction if none passed', async () => {
    sequelize.models.dog.create.mockResolvedValue({ id: 123, breed: 'breed', name: 'Bruno' })

    const dog = {
      id: 123,
      name: 'Bruno',
      owner: { firstName: 'John', lastName: 'Smith' }
    }

    await addImportedDog(dog, devUser)
    expect(sequelize.transaction).toHaveBeenCalledTimes(1)
  })

  test('addImportedDog should create dog', async () => {
    sequelize.models.dog.create.mockResolvedValue({ id: 123, breed: 'breed', name: 'Bruno' })

    const dog = {
      id: 123,
      name: 'Bruno',
      owner: { firstName: 'John', lastName: 'Smith' }
    }

    await addImportedDog(dog, devUser, {})
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

  test('updateDogFields should update fields', async () => {
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
    updateDogFields(dbDog, payload, breeds, await getStatuses())
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

  test('updateDog should create new transaction if not passed', async () => {
    const mockSave = jest.fn()
    sequelize.models.dog.findOne.mockResolvedValue({ id: 123, breed: 'Breed 1', name: 'Bruno', save: mockSave })
    sequelize.models.microchip.findAll.mockResolvedValue([])
    sequelize.models.microchip.create.mockResolvedValue({ id: 101 })
    sequelize.models.search_index.findAll.mockResolvedValue([])

    const payload = {
      microchipNumber: '456',
      breed: 'Breed 1'
    }

    await updateDog(payload, devUser)

    expect(sequelize.transaction).toHaveBeenCalledTimes(1)
  })

  test('updateDog should not create new transaction if one is passed', async () => {
    const mockSave = jest.fn()
    sequelize.models.dog.findOne.mockResolvedValue({ id: 123, breed: 'Breed 1', name: 'Bruno', status: 'Failed', save: mockSave })
    sequelize.models.microchip.findAll.mockResolvedValue([])
    sequelize.models.microchip.create.mockResolvedValue({ id: 101 })
    sequelize.models.search_index.findAll.mockResolvedValue([])

    const payload = {
      microchipNumber: '456',
      breed: 'Breed 1'
    }

    await updateDog(payload, devUser, {})

    expect(sequelize.transaction).toHaveBeenCalledTimes(0)
  })

  test('updateStatus should create new transaction if not passed', async () => {
    const mockSave = jest.fn()
    sequelize.models.dog.findOne.mockResolvedValue({ id: 123, breed: 'Breed 1', name: 'Bruno', save: mockSave })

    await updateStatus('ED123', 'Failed')

    expect(sequelize.transaction).toHaveBeenCalledTimes(1)
  })

  test('updateStatus should not create new transaction if one is passed', async () => {
    const mockSave = jest.fn()
    sequelize.models.dog.findOne.mockResolvedValue({ id: 123, breed: 'Breed 1', name: 'Bruno', save: mockSave })

    await updateStatus('ED123', 'Failed', {})

    expect(sequelize.transaction).toHaveBeenCalledTimes(0)
  })
})
