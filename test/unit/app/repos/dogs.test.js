const { breeds: mockBreeds } = require('../../../mocks/dog-breeds')
const { statuses: mockStatuses } = require('../../../mocks/statuses')
const { payload: mockCdoPayload } = require('../../../mocks/cdo/create')

jest.mock('../../../../app/repos/insurance')
const { createInsurance } = require('../../../../app/repos/insurance')

jest.mock('../../../../app/lookups')
const { getBreed, getExemptionOrder } = require('../../../../app/lookups')

jest.mock('../../../../app/messaging/send-event')
const { sendEvent } = require('../../../../app/messaging/send-event')

jest.mock('../../../../app/repos/search')
const { removeDogFromSearchIndex } = require('../../../../app/repos/search')

jest.mock('../../../../app/messaging/send-audit')
const { sendDeleteToAudit } = require('../../../../app/messaging/send-audit')

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
        findAll: jest.fn(),
        destroy: jest.fn()
      },
      person: {
        findAll: jest.fn()
      },
      registration: {
        findByPk: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn(),
        destroy: jest.fn()
      },
      registered_person: {
        create: jest.fn(),
        findOne: jest.fn()
      },
      microchip: {
        findOne: jest.fn(),
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
    transaction: jest.fn(),
    literal: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  const { getBreeds, getStatuses, createDogs, addImportedDog, getDogByIndexNumber, getAllDogIds, updateDog, updateStatus, updateDogFields, deleteDogByIndexNumber, switchOwnerIfNecessary, buildSwitchedOwner, constructStatusList, constructDbSort, getOldDogs, generateClausesForOr } = require('../../../../app/repos/dogs')

  beforeEach(async () => {
    jest.clearAllMocks()

    getBreed.mockResolvedValue({ id: 1, breed: 'Breed 1' })
    getExemptionOrder.mockResolvedValue({ id: 1, exemption_order: '2015' })
    sequelize.models.dog_breed.findAll.mockResolvedValue(mockBreeds)
    sequelize.models.status.findAll.mockResolvedValue(mockStatuses)
    createInsurance.mockResolvedValue()
    sendEvent.mockResolvedValue()
  })

  describe('getBreeds', () => {
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
  })

  describe('getStatuses', () => {
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
  })

  describe('createDogs', () => {
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
        save: dogSave,
        registered_person: [{
          person: {
            person_reference: 'P-123'
          }
        }]
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

      const owners = [{ id: 1, person_reference: 'P-123', ...mockCdoPayload.owner }]
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
        registered_person: [{
          person: { person_reference: 'P-123' }
        }],
        registration: {
          id: 1,
          cdoIssued: '2020-01-01',
          cdoExpiry: '2020-02-01'
        },
        status_id: 2
      })
    })
  })

  describe('addImportedDog', () => {
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
  })

  describe('getDogByIndexNumber', () => {
    test('getDogByIndexNumber should return dog', async () => {
      sequelize.models.dog.findOne.mockResolvedValue({ id: 123, breed: 'breed', name: 'Bruno' })

      const res = await getDogByIndexNumber('ED123')
      expect(sequelize.models.dog.findOne).toHaveBeenCalledTimes(1)
      expect(res).not.toBe(null)
      expect(res.id).toBe(123)
    })
  })

  describe('getAllDogIds', () => {
    test('getAllDogIds should return dog ids', async () => {
      sequelize.models.dog.findAll.mockResolvedValue([123, 456])

      const res = await getAllDogIds()
      expect(sequelize.models.dog.findAll).toHaveBeenCalledTimes(1)
      expect(res).not.toBe(null)
      expect(res.length).toBe(2)
      expect(res[0]).toBe(123)
      expect(res[1]).toBe(456)
    })
  })

  describe('updateDogFields', () => {
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
  })

  describe('updateDog', () => {
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
  })

  describe('updateStatus', () => {
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

  describe('deleteDogByIndexNumber', () => {
    test('should create a new transaction if not passed', async () => {
      await deleteDogByIndexNumber('ED123', devUser)
      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('should delete a dog given dog is found', async () => {
      const mockDogDestroy = jest.fn()
      const mockMicrochipDestroy = jest.fn()
      const mockDogMicrochipDestroy = jest.fn()
      const mockRegistrationDestroy = jest.fn()
      const mockRegisteredPersonDestroy = jest.fn()

      const mockDogAggregrate = {
        id: 123,
        breed: 'Breed 1',
        name: 'Bruno',
        registration: {
          id: 1,
          cdoIssued: '2020-01-01',
          cdoExpiry: '2020-02-01',
          destroy: mockRegistrationDestroy
        },
        registered_person: [{
          destroy: mockRegisteredPersonDestroy
        }],
        dog_microchips: [
          { microchip: { microchip_number: 123456789012345, destroy: mockMicrochipDestroy }, destroy: mockDogMicrochipDestroy },
          { microchip: { microchip_number: 112345678901234, destroy: mockMicrochipDestroy }, destroy: mockDogMicrochipDestroy }
        ],
        destroy: mockDogDestroy
      }
      sequelize.models.dog.findOne.mockResolvedValue(mockDogAggregrate)

      await deleteDogByIndexNumber('ED123', devUser, {})

      expect(removeDogFromSearchIndex).toBeCalledWith(mockDogAggregrate, {})
      expect(sequelize.models.dog.findOne).toBeCalledWith(expect.objectContaining({
        where: { index_number: 'ED123' }
      }))
      expect(mockRegistrationDestroy).toHaveBeenCalledTimes(1)
      expect(mockRegisteredPersonDestroy).toHaveBeenCalledTimes(1)
      expect(mockMicrochipDestroy).toHaveBeenCalledTimes(2)
      expect(mockDogMicrochipDestroy).toHaveBeenCalledTimes(2)
      expect(mockDogDestroy).toHaveBeenCalled()
      expect(sendDeleteToAudit).toHaveBeenCalledWith('dog', mockDogAggregrate, devUser)
    })
  })

  describe('switchOwnerIfNecessary', () => {
    test('should switch if different owner', async () => {
      const mockSave = jest.fn()
      sequelize.models.registered_person.findOne.mockResolvedValue({ person_id: 55555, save: mockSave })

      const dogAndOwner = {
        id: 12345,
        name: 'Rex',
        registered_person: [
          {
            person: { person_reference: 'P-123' }
          }
        ]
      }

      const newOwners = [
        { person_reference: 'P-456' }
      ]

      await switchOwnerIfNecessary(dogAndOwner, newOwners, {})

      expect(sequelize.models.registered_person.findOne).toHaveBeenCalledWith({ where: { dog_id: 12345 } })
      expect(mockSave).toHaveBeenCalledTimes(1)
    })

    test('should not switch if same owner', async () => {
      const mockSave = jest.fn()
      sequelize.models.registered_person.findOne.mockResolvedValue({ person_id: 55555, save: mockSave })

      const dogAndOwner = {
        id: 12345,
        name: 'Rex',
        registered_person: [
          {
            person: { person_reference: 'P-123' }
          }
        ]
      }

      const newOwners = [
        { person_reference: 'P-123' }
      ]

      await switchOwnerIfNecessary(dogAndOwner, newOwners, {})

      expect(sequelize.models.registered_person.findOne).not.toHaveBeenCalled()
      expect(mockSave).toHaveBeenCalledTimes(0)
    })

    test('buildSwitchedOwner should handle address format 1', async () => {
      sequelize.models.person.findAll.mockResolvedValue([{ organisation: { organisation_name: 'my org' } }])

      const owner = {
        id: 10,
        person_reference: 'P-123',
        first_name: 'John',
        last_name: 'Smith',
        address: {
          address_line_1: 'addr1',
          address_line_2: 'addr2',
          postcode: 'PS1 1PS'
        }
      }

      const res = await buildSwitchedOwner(owner)

      expect(res).toEqual({
        id: 10,
        personReference: 'P-123',
        firstName: 'John',
        lastName: 'Smith',
        address: {
          address_line_1: 'addr1',
          address_line_2: 'addr2',
          postcode: 'PS1 1PS'
        },
        organisationName: 'my org'
      })
    })

    test('buildSwitchedOwner should handle address format 2', async () => {
      sequelize.models.person.findAll.mockResolvedValue({ })

      const owner = {
        id: 10,
        person_reference: 'P-123',
        first_name: 'John',
        last_name: 'Smith',
        addresses: [{
          address: {
            address_line_1: 'addr1',
            address_line_2: 'addr2',
            postcode: 'PS1 1PS'
          }
        }]
      }

      const res = await buildSwitchedOwner(owner)

      expect(res).toEqual({
        id: 10,
        personReference: 'P-123',
        firstName: 'John',
        lastName: 'Smith',
        address: {
          address_line_1: 'addr1',
          address_line_2: 'addr2',
          postcode: 'PS1 1PS'
        },
        organisationName: undefined
      })
    })
  })

  describe('constructStatusList', () => {
    test('should construct correct status id list if more than one status', async () => {
      const statusList = 'Pre-exempt,Exempt,In breach'

      const res = await constructStatusList(statusList)

      expect(res).toEqual([2, 3, 5])
    })

    test('should construct correct status id list if only one status', async () => {
      const statusList = 'Failed'

      const res = await constructStatusList(statusList)

      expect(res).toEqual([4])
    })

    test('should construct correct status id list if only one status', async () => {
      const res = await constructStatusList(null)

      expect(res).toEqual([])
    })
  })

  describe('constructDbSort', () => {
    test('should construct default sort construct when no params supplied', async () => {
      sequelize.col.mockReturnValue((column) => column)
      sequelize.literal = jest.fn()

      const res = constructDbSort(null, [1, 2])

      expect(res.length).toBe(2)
    })

    test('should construct correct sort construct', async () => {
      sequelize.col.mockReturnValue((column) => column)

      let res = constructDbSort({ sortOrder: 'DESC', sortKey: 'cdoIssued' })
      expect(res).toEqual([[sequelize.col('dog.index_number'), 'DESC']])

      res = constructDbSort({ sortOrder: 'DESC', sortKey: 'indexNumber' })
      expect(res).toEqual([[sequelize.col('dog.index_number'), 'DESC']])

      res = constructDbSort({ sortOrder: 'DESC', sortKey: 'dateOfBirth' })
      expect(res).toEqual([[sequelize.col('dog.index_number'), 'DESC']])

      res = constructDbSort({ sortOrder: 'ASC', sortKey: 'selected' })
      expect(res).toEqual([])
    })
  })

  describe('getOldDogs', () => {
    test('should construct correct correct where clause', async () => {
      sequelize.models.registration.findAll.mockResolvedValue()
      const statusList = 'Pre-exempt,Exempt'

      await getOldDogs(statusList)

      // console.log('here1', sequelize.models.registration.findAll.mock.calls[0][0].where)
      // expect(sequelize.models.registration.findAll.mock.calls[0][0].where.toString()).toContain('"where": {Symbol(and): [{Symbol(or): [{"$dog.birth_date$": {Symbol(lte): 2009-05-28T23:00:00.000Z}}, {Symbol(and): [{"$dog.birth_date$": {Symbol(eq): null}}, {"cdo_issued": {Symbol(lte): 2009-05-28T23:00:00.000Z}}]}]}, {"$dog.status_id$": {Symbol(in): [2, 3]}}]}}')
    })
  })

  describe('generateClausesForOr', () => {
    test('should handle dates before 2038', () => {
      const res = generateClausesForOr(new Date(2024, 1, 1), new Date(2009, 1, 1), new Date(2038, 1, 1))

      expect(res.length).toBe(2)
    })

    test('should handle dates from 2038 onwards', () => {
      const res = generateClausesForOr(new Date(2038, 1, 2), new Date(2023, 1, 1), new Date(2038, 1, 1))

      expect(res.length).toBe(3)
    })
  })
})
