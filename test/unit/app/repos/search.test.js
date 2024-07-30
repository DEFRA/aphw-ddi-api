jest.mock('../../../../app/repos/dogs')
const { getDogByIndexNumber } = require('../../../../app/repos/dogs')

describe('Search repo', () => {
  const mockTransaction = jest.fn()
  jest.mock('../../../../app/config/db', () => ({
    models: {
      search_index: {
        create: jest.fn(),
        save: jest.fn(),
        destroy: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn()
      },
      person: {
        findOne: jest.fn()
      }
    },
    col: jest.fn(),
    transaction: jest.fn().mockImplementation(async (fn) => {
      return await fn(mockTransaction)
    }),
    fn: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  const { addToSearchIndex, buildAddressString, updateSearchIndexDog, updateSearchIndexPerson, applyMicrochips, removeDogFromSearchIndex, cleanupPossibleOwnerWithNoDogs } = require('../../../../app/repos/search')

  const { dbFindByPk } = require('../../../../app/lib/db-functions')
  jest.mock('../../../../app/lib/db-functions')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('addToSearchIndex', () => {
    test('addToSearchIndex should call create and not destroy for new dog', async () => {
      sequelize.models.search_index.create.mockResolvedValue()
      getDogByIndexNumber.mockResolvedValue({ id: 1, index_number: 'ED1' })

      const person = {
        id: 123,
        firstName: 'John',
        lastName: 'Smith',
        dogIndex: 123,
        address: {
          address_line_1: '123 some address'
        }
      }

      const dog = {
        id: 456,
        dogName: 'Bruno',
        microchipNumber: 123456789012345
      }

      dbFindByPk.mockResolvedValue(dog)

      await addToSearchIndex(person, dog, {})

      expect(sequelize.models.search_index.create).toHaveBeenCalledTimes(1)
      expect(sequelize.models.search_index.destroy).not.toHaveBeenCalled()
    })

    test('addToSearchIndex should call destroy for existing dog', async () => {
      sequelize.models.search_index.create.mockResolvedValue()
      getDogByIndexNumber.mockResolvedValue({ id: 1, index_number: 'ED1' })

      const person = {
        id: 123,
        firstName: 'John',
        lastName: 'Smith',
        address: {
          address_line_1: '123 some address'
        }
      }

      const dog = {
        id: 456,
        dogIndex: 123,
        dogName: 'Bruno',
        existingDog: true,
        microchipNumber: 123456789012345
      }

      dbFindByPk.mockResolvedValue(dog)

      await addToSearchIndex(person, dog, {})

      expect(sequelize.models.search_index.create).toHaveBeenCalledTimes(1)
      expect(sequelize.models.search_index.destroy).toHaveBeenCalledTimes(1)
    })

    test('addToSearchIndex should call destroy for existing dog and handle change of owner', async () => {
      sequelize.models.search_index.create.mockResolvedValue()
      getDogByIndexNumber.mockResolvedValue({ id: 1, index_number: 'ED1' })

      const person = {
        id: 123,
        firstName: 'John',
        lastName: 'Smith',
        address: {
          address_line_1: '123 some address'
        }
      }

      const dog = {
        id: 456,
        dogIndex: 123,
        dogName: 'Bruno',
        existingDog: true,
        microchipNumber: 123456789012345,
        changedOwner: {
          oldOwner: {
            firstName: 'John',
            lastName: 'Smith'
          },
          newOwner: {
            firstName: 'Peter',
            lastName: 'Snow'
          }
        }
      }

      dbFindByPk.mockResolvedValue(dog)

      await addToSearchIndex(person, dog, {})

      expect(sequelize.models.search_index.create).toHaveBeenCalledTimes(2)
      expect(sequelize.models.search_index.destroy).toHaveBeenCalledTimes(1)
    })

    test('addToSearchIndex should create new transaction if none passed', async () => {
      sequelize.models.search_index.create.mockResolvedValue()
      getDogByIndexNumber.mockResolvedValue({ id: 1, index_number: 'ED1' })

      const person = {
        id: 123,
        firstName: 'John',
        lastName: 'Smith',
        address: {
          address_line_1: '123 some address'
        }
      }

      const dog = {
        id: 456,
        dogIndex: 123,
        dogName: 'Bruno',
        existingDog: true,
        microchipNumber: 123456789012345,
        microchipNumber2: 112345678901234
      }

      const dogFromDb = {
        id: 456,
        index_number: 123,
        name: 'Bruno',
        dog_microchips: [
          { microchip: { microchip_number: 123456789012345 } },
          { microchip: { microchip_number: 112345678901234 } }
        ]
      }

      dbFindByPk.mockResolvedValue(dogFromDb)

      await addToSearchIndex(person, dog)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })
  })

  describe('buildAddressString', () => {
    test('buildAddressString should return parts', async () => {
      const address = {
        address_line_1: 'addr1',
        address_line_2: 'addr2',
        town: 'town',
        postcode: 'post code'
      }

      const parts = await buildAddressString(address, true)

      expect(parts).toBe('addr1, addr2, town, post code, postcode')
    })

    test('buildAddressString should return parts 2', async () => {
      const address = {
        address_line_1: 'addr1',
        address_line_2: 'addr2',
        town: 'town',
        postcode: 'postcode'
      }

      const parts = await buildAddressString(address)

      expect(parts).toBe('addr1, addr2, town, postcode')
    })

    test('buildAddressString should return parts without alternate', async () => {
      const address = {
        address_line_1: 'addr1',
        address_line_2: 'addr2',
        town: 'town',
        postcode: 'post code'
      }

      const parts = await buildAddressString(address)

      expect(parts).toBe('addr1, addr2, town, post code')
    })
  })

  describe('UpdateSearchIndexDog', () => {
    test('UpdateSearchIndexDog should call search_index save for each row', async () => {
      const mockSave = jest.fn()
      sequelize.models.search_index.findAll.mockResolvedValue([
        { dog_id: 1, person_id: 1, search: '12345', json: '{ dogName: \'Bruno\' }', save: mockSave },
        { dog_id: 2, person_id: 2, search: '34567', json: '{ dogName: \'Fido\' }', save: mockSave }
      ])

      const dog = {
        id: 1,
        dogIndex: 123,
        dogName: 'Bruno2',
        microchipNumber: 123456789012345,
        microchipNumber2: 234567890123456
      }

      await updateSearchIndexDog(dog, {})

      expect(mockSave).toHaveBeenCalledTimes(2)
    })
  })

  describe('UpdateSearchIndexPerson', () => {
    test('UpdateSearchIndexPerson should call search_index save for each row', async () => {
      const mockSave = jest.fn()
      sequelize.models.search_index.findAll.mockResolvedValue([
        { dog_id: 1, person_id: 1, search: '12345', json: '{ dogName: \'Bruno\', firstName: \'John\' }', save: mockSave }
      ])

      const person = {
        id: 1,
        dogIndex: 123,
        firstName: 'Mark',
        address: {
          address_line_1: 'address line 1',
          postcode: 'postcode'
        }
      }

      await updateSearchIndexPerson(person, {})

      expect(mockSave).toHaveBeenCalledTimes(1)
    })

    test('UpdateSearchIndexPerson should call search_index save for each row when changes', async () => {
      const mockSave = jest.fn()
      sequelize.models.search_index.findAll.mockResolvedValue([
        { dog_id: 1, person_id: 1, search: '12345', json: '{ dogName: \'Bruno\', firstName: \'John\', lastName: \'Smith\' }', save: mockSave }
      ])

      const person = {
        id: 1,
        dogIndex: 123,
        firstName: 'John',
        lastName: 'Walker',
        address: {
          address_line_1: 'address line 1',
          postcode: 'postcode'
        }
      }

      await updateSearchIndexPerson(person, {})

      expect(mockSave).toHaveBeenCalledTimes(1)
    })
  })

  describe('applyMicrochips', () => {
    test('applyMicrochips should set microchip numbers at root', async () => {
      const dog = {
        dog_microchips: [
          { microchip: { microchip_number: 1234567890 } },
          { microchip: { microchip_number: 2345678901 } }
        ]
      }

      applyMicrochips(dog)

      expect(dog).toEqual({
        dog_microchips: [
          { microchip: { microchip_number: 1234567890 } },
          { microchip: { microchip_number: 2345678901 } }
        ],
        microchip_number: 1234567890,
        microchip_number2: 2345678901
      })
    })
  })

  describe('removeDogFromSearchIndex', () => {
    test('should create new transaction if none passed', async () => {
      const mockDestroy = jest.fn()
      sequelize.models.search_index.findAll.mockResolvedValue([
        { dog_id: 456, person_id: 1, search: '12345', json: { dogName: 'Bruno' }, destroy: mockDestroy }
      ])
      sequelize.models.search_index.findOne.mockResolvedValue({})
      const dogFromDb = {
        id: 456,
        index_number: 123,
        name: 'Bruno',
        dog_microchips: [
          { microchip: { microchip_number: 123456789012345 } },
          { microchip: { microchip_number: 112345678901234 } }
        ]
      }

      await removeDogFromSearchIndex(dogFromDb)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('should delete the search index if not last dog of owner', async () => {
      const mockDestroy = jest.fn()
      sequelize.models.search_index.findAll.mockResolvedValue([
        { dog_id: 456, person_id: 1, search: '12345', json: { dogName: 'Bruno' }, destroy: mockDestroy }
      ])
      sequelize.models.search_index.findOne.mockResolvedValue({})
      const dogFromDb = {
        id: 456,
        index_number: 123,
        name: 'Bruno',
        dog_microchips: [
          { microchip: { microchip_number: 123456789012345 } },
          { microchip: { microchip_number: 112345678901234 } }
        ],
        registered_person: [
          { id: 2, person_id: 1 }
        ]
      }

      await removeDogFromSearchIndex(dogFromDb, {})
      expect(sequelize.models.search_index.findAll).toHaveBeenCalledWith({ where: { dog_id: 456 }, transaction: {} })
      expect(mockDestroy).toHaveBeenCalledTimes(1)

      expect(sequelize.transaction).not.toHaveBeenCalled()
    })

    test('should delete the search index and create person index when last dog of owner', async () => {
      const mockDestroy = jest.fn()
      sequelize.models.search_index.findAll.mockResolvedValue([
        {
          dog_id: 456,
          person_id: 1,
          search: '12345',
          json: {
            dogName: 'Bruno',
            firstName: 'John',
            lastName: 'Smith',
            personReference: 'P-123',
            address: { address_line_1: 'addr1', address_line_2: 'addr2', town: 'town', postcode: 'postcode' },
            organisationName: 'org name'
          },
          destroy: mockDestroy
        }
      ])
      sequelize.models.search_index.findOne.mockResolvedValue()
      sequelize.fn.mockImplementation((a, b) => b)
      const dogFromDb = {
        id: 456,
        index_number: 123,
        name: 'Bruno',
        dog_microchips: [
          { microchip: { microchip_number: 123456789012345 } },
          { microchip: { microchip_number: 112345678901234 } }
        ],
        registered_person: [
          { id: 2, person_id: 1 }
        ]
      }

      await removeDogFromSearchIndex(dogFromDb, {})
      expect(sequelize.models.search_index.findAll).toHaveBeenCalledWith({ where: { dog_id: 456 }, transaction: {} })
      expect(mockDestroy).toHaveBeenCalledTimes(1)

      expect(sequelize.transaction).not.toHaveBeenCalled()
      expect(sequelize.models.search_index.create).toHaveBeenCalledWith({
        search: 'P-123 John Smith org name addr1, addr2, town, postcode',
        person_id: 1,
        dog_id: null,
        json: {
          firstName: 'John',
          lastName: 'Smith',
          personReference: 'P-123',
          address: { address_line_1: 'addr1', address_line_2: 'addr2', town: 'town', postcode: 'postcode' },
          organisationName: 'org name',
          dogName: undefined,
          dogIndex: undefined,
          dogStatus: undefined,
          microchipNumber: undefined,
          microchipNumber2: undefined
        }
      },
      expect.anything())
    })

    test('should delete the search index and create person index when last dog of owner - for each of multiple people', async () => {
      const mockDestroy = jest.fn()
      sequelize.models.search_index.findAll.mockResolvedValue([
        {
          dog_id: 456,
          person_id: 1,
          search: '12345',
          json: {
            dogName: 'Bruno',
            firstName: 'John',
            lastName: 'Smith',
            personReference: 'P-123',
            address: { address_line_1: 'addr1', address_line_2: 'addr2', town: 'town', postcode: 'postcode' },
            organisationName: 'org name'
          },
          destroy: mockDestroy
        },
        {
          dog_id: 456,
          person_id: 2,
          search: '12345',
          json: {
            dogName: 'Bruno',
            firstName: 'Peter',
            lastName: 'Johnson',
            personReference: 'P-234',
            address: { address_line_1: 'addr1', address_line_2: 'addr2', town: 'town', postcode: 'postcode' },
            organisationName: 'org name2'
          },
          destroy: mockDestroy
        },
        {
          dog_id: 456,
          person_id: 2,
          search: '12345',
          json: {
            dogName: 'Bruno',
            firstName: 'Peter',
            lastName: 'Johnson',
            personReference: 'P-234',
            address: { address_line_1: 'addr1', address_line_2: 'addr2', town: 'town', postcode: 'postcode' },
            organisationName: 'org name2'
          },
          destroy: mockDestroy
        }
      ])
      sequelize.models.search_index.findOne.mockResolvedValue()
      sequelize.fn.mockImplementation((a, b) => b)
      const dogFromDb = {
        id: 456,
        index_number: 123,
        name: 'Bruno',
        dog_microchips: [
          { microchip: { microchip_number: 123456789012345 } },
          { microchip: { microchip_number: 112345678901234 } }
        ],
        registered_person: [
          { id: 2, person_id: 1 }
        ]
      }

      await removeDogFromSearchIndex(dogFromDb, {})
      expect(sequelize.models.search_index.findAll).toHaveBeenCalledWith({ where: { dog_id: 456 }, transaction: {} })
      expect(mockDestroy).toHaveBeenCalledTimes(3)

      expect(sequelize.transaction).not.toHaveBeenCalled()
      expect(sequelize.models.search_index.create).toHaveBeenCalledTimes(2)
    })
  })

  describe('cleanupPossibleOwnerWithNoDogs', () => {
    test('should remove records of same person prior to adding dog', async () => {
      const mockDestroy = jest.fn()
      sequelize.models.search_index.findAll.mockResolvedValue([
        { person_id: 123, json: 'some json', destroy: mockDestroy },
        { person_id: 123, json: 'more json', destroy: mockDestroy },
        { person_id: 123, json: 'extra json', destroy: mockDestroy }
      ])
      await cleanupPossibleOwnerWithNoDogs(123, {})

      expect(sequelize.models.search_index.findAll).toHaveBeenCalledTimes(1)
      expect(mockDestroy).toHaveBeenCalledTimes(3)
    })

    test('should not remove records of same person if none exist with no dog', async () => {
      const mockDestroy = jest.fn()
      sequelize.models.search_index.findAll.mockResolvedValue([])
      await cleanupPossibleOwnerWithNoDogs(123, {})

      expect(sequelize.models.search_index.findAll).toHaveBeenCalledTimes(1)
      expect(mockDestroy).toHaveBeenCalledTimes(0)
    })
  })
})
