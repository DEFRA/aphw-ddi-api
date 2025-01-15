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
      }
    },
    col: jest.fn(),
    transaction: jest.fn().mockImplementation(async (fn) => {
      return await fn(mockTransaction)
    }),
    fn: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  jest.mock('../../../../app/repos/search-tgrams')
  const { updateTrigramsPerDogOrPerson } = require('../../../../app/repos/search-tgrams')

  jest.mock('../../../../app/repos/search-match-codes')
  const { updateMatchCodesPerPerson } = require('../../../../app/repos/search-match-codes')

  const { updateSearchIndexDog, updateSearchIndexPerson, addPeopleOnlyIfNoDogsLeft } = require('../../../../app/repos/search-index')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('UpdateSearchIndexDog', () => {
    test('should handle sub-status', async () => {
      const mockSave = jest.fn()
      sequelize.models.search_index.findAll.mockResolvedValue([
        {
          dog_id: 1,
          person_id: 1,
          search: '12345',
          json: {
            dogName: 'Bruno',
            dogStatus: 'Inactive'
          },
          save: mockSave
        }
      ])

      const dog = {
        id: 1,
        index_number: 123,
        name: 'Bruno2',
        status: { status: 'Inactive' },
        dog_microchips: [
          { id: 1, microchip: { id: 1, microchip_number: '123456789012345' } },
          { id: 2, microchip: { id: 2, microchip_number: '234567890123456' } }
        ],
        stolen_date: '2024-05-15'
      }

      await updateSearchIndexDog(dog, {})

      expect(mockSave).toHaveBeenCalledTimes(1)
      const expectDogCall = {
        dog_id: 1,
        json: {
          address: {
            address_line_1: undefined,
            address_line_2: undefined,
            postcode: undefined,
            town: undefined
          },
          dogIndex: 123,
          dogName: 'Bruno2',
          dogStatus: 'Inactive',
          dogSubStatus: 'stolen',
          email: undefined,
          firstName: undefined,
          lastName: undefined,
          microchipNumber: '123456789012345',
          microchipNumber2: '234567890123456',
          organisationName: undefined,
          personReference: undefined
        },
        person_id: 1,
        save: expect.anything(),
        search: undefined
      }
      expect(updateTrigramsPerDogOrPerson).toHaveBeenCalledWith(1, 'dog', expectDogCall, {})
    })
  })

  describe('UpdateSearchIndexPerson', () => {
    test('should handle sub-status', async () => {
      const mockSave = jest.fn()
      sequelize.models.search_index.findAll.mockResolvedValue([
        {
          dog_id: 1,
          person_id: 1,
          search: '12345',
          json: {
            dogIndex: 'ED123',
            dogName: 'Bruno',
            dogStatus: 'Inactive',
            dogSubStatus: 'dead',
            firstName: 'John',
            lastName: 'Smith'
          },
          save: mockSave
        }
      ])

      const person = {
        id: 1,
        firstName: 'Peter',
        lastName: 'Smith',
        address: {}
      }

      await updateSearchIndexPerson(person, {})

      expect(mockSave).toHaveBeenCalledTimes(1)
      const expectPersonCall = {
        dog_id: 1,
        person_id: 1,
        search: undefined,
        json: {
          firstName: 'Peter',
          lastName: 'Smith',
          email: undefined,
          organisationName: undefined,
          address: {
            address_line_1: undefined,
            address_line_2: undefined,
            postcode: undefined,
            town: undefined
          },
          dogIndex: 'ED123',
          dogName: 'Bruno',
          dogStatus: 'Inactive',
          microchipNumber: undefined,
          microchipNumber2: undefined,
          personReference: undefined,
          dogSubStatus: 'dead'
        },
        save: expect.anything()
      }
      expect(updateTrigramsPerDogOrPerson).toHaveBeenCalledWith(1, 'person', expectPersonCall, {})
    })
  })

  describe('addPeopleOnlyIfNoDogsLeft', () => {
    test('should handle person with json structure', async () => {
      const mockSave = jest.fn()
      sequelize.models.search_index.findAll.mockResolvedValue([
        { dog_id: 1, person_id: 1, search: '12345', json: '{ firstName: \'John\', lastName: \'Smith\' }', save: mockSave }
      ])

      const persons = new Map()
      persons.set(1, {
        json: {
          id: 1,
          personReference: 'P-123',
          firstName: 'Peter',
          lastName: 'Brown',
          organisationName: 'My Org Name',
          address: {
            address_line_1: 'addr1',
            address_line_2: 'addr2',
            town: 'town',
            postcode: 'postcode',
            country: 'England'
          },
          email: 'myemail@email.com'
        }
      })

      await addPeopleOnlyIfNoDogsLeft(persons, {})

      expect(sequelize.models.search_index.create).toHaveBeenCalledTimes(1)
      const partialPerson = {
        first_name: 'Peter',
        last_name: 'Brown',
        email: 'myemail@email.com',
        organisation_name: 'My Org Name',
        address: {
          address_line_1: 'addr1',
          address_line_2: 'addr2',
          postcode: 'postcode',
          town: 'town',
          country: 'England'
        },
        person_reference: 'P-123'
      }
      expect(updateMatchCodesPerPerson).toHaveBeenCalledWith(1, { json: partialPerson }, {})
      expect(updateTrigramsPerDogOrPerson).toHaveBeenCalledWith(1, 'person', { json: partialPerson }, {})
    })

    test('should handle person with without json structure', async () => {
      const mockSave = jest.fn()
      sequelize.models.search_index.findAll.mockResolvedValue([
        { dog_id: 1, person_id: 1, search: '12345', json: '{ firstName: \'John\', lastName: \'Smith\' }', save: mockSave }
      ])

      const persons = new Map()
      persons.set(1, {
        id: 1,
        personReference: 'P-123',
        firstName: 'Peter',
        lastName: 'Brown',
        organisationName: 'My Org Name',
        address: {
          address_line_1: 'addr1',
          address_line_2: 'addr2',
          town: 'town',
          postcode: 'postcode',
          country: 'England'
        },
        email: 'myemail@email.com'
      })

      await addPeopleOnlyIfNoDogsLeft(persons, {})

      expect(sequelize.models.search_index.create).toHaveBeenCalledTimes(1)
      const partialPerson = {
        first_name: 'Peter',
        last_name: 'Brown',
        email: 'myemail@email.com',
        organisation_name: 'My Org Name',
        address: {
          address_line_1: 'addr1',
          address_line_2: 'addr2',
          postcode: 'postcode',
          town: 'town',
          country: 'England'
        },
        person_reference: 'P-123'
      }
      expect(updateMatchCodesPerPerson).toHaveBeenCalledWith(1, { json: partialPerson }, {})
      expect(updateTrigramsPerDogOrPerson).toHaveBeenCalledWith(1, 'person', { json: partialPerson }, {})
    })
  })
})
