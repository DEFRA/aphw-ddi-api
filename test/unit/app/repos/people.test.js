const { when } = require('jest-when')
const { owner: mockOwner } = require('../../../mocks/cdo/create')
const { owner: mockEnhancedOwner } = require('../../../mocks/cdo/create-enhanced')

jest.mock('../../../../app/messaging/send-event')
const { sendEvent } = require('../../../../app/messaging/send-event')

const dummyUser = {
  username: 'dummy-user',
  displayname: 'Dummy User'
}

describe('People repo', () => {
  const mockTransaction = jest.fn()
  jest.mock('../../../../app/config/db', () => ({
    models: {
      person: {
        create: jest.fn(),
        findOne: jest.fn(),
        findAll: jest.fn(),
        findByPk: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        destroy: jest.fn()
      },
      address: {
        create: jest.fn(),
        findByPk: jest.fn()
      },
      person_address: {
        create: jest.fn(),
        findAll: jest.fn()
      },
      registered_person: {
        findAll: jest.fn(),
        findOne: jest.fn()
      },
      dog: {
        findAll: jest.fn()
      },
      person_contact: {
        create: jest.fn(),
        findAll: jest.fn()
      },
      contact: {
        create: jest.fn(),
        findByPk: jest.fn()
      },
      search_index: {
        destroy: jest.fn()
      },
      search_match_code: {
        destroy: jest.fn()
      },
      search_tgram: {
        destroy: jest.fn()
      }
    },
    col: jest.fn(),
    transaction: jest.fn().mockImplementation(async (fn) => {
      await fn(mockTransaction)
      return {
        commit: jest.fn(),
        rollback: jest.fn()
      }
    }),
    literal: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  jest.mock('../../../../app/lookups')
  const { getContactType, getCountry } = require('../../../../app/lookups')

  jest.mock('../../../../app/repos/police-force-helper')
  const { hasForceChanged } = require('../../../../app/repos/police-force-helper')

  jest.mock('../../../../app/repos/search-index')
  const { updateSearchIndexPerson } = require('../../../../app/repos/search-index')

  const { createPeople, getPersonByReference, getPersonAndDogsByReference, getPersonAndDogsByIndex, updatePerson, getOwnerOfDog, updatePersonFields, deletePerson, purgePersonByReferenceNumber, updatePersonEmail } = require('../../../../app/repos/people')

  beforeEach(async () => {
    jest.clearAllMocks()

    when(getContactType).calledWith('Phone').mockResolvedValue({ id: 1 })
    when(getContactType).calledWith('Email').mockResolvedValue({ id: 2 })
    when(getContactType).calledWith('SecondaryPhone').mockResolvedValue({ id: 3 })

    when(getCountry).calledWith('England').mockResolvedValue({ id: 1 })
    when(getCountry).calledWith('Wales').mockResolvedValue({ id: 2 })
    hasForceChanged.mockResolvedValue()

    sendEvent.mockResolvedValue()
  })

  describe('createPeople', () => {
    test('createPeople should start new transactions if none passed', async () => {
      const people = [mockOwner]

      const mockAddress = {
        id: 1,
        address_line_1: 'Address 1',
        address_line_2: 'Address 2',
        town: 'Town',
        postcode: 'Postcode'
      }

      sequelize.models.person.count.mockResolvedValue(0)

      sequelize.models.person.create.mockResolvedValue({
        dataValues: {
          id: 1,
          first_name: 'First',
          last_name: 'Last'
        }
      })

      sequelize.models.address.create.mockResolvedValue({ ...mockAddress })

      sequelize.models.address.findByPk.mockResolvedValue({ ...mockAddress })

      sequelize.models.contact.create.mockResolvedValue({
        id: 555
      })

      await createPeople(people)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('createPeople should not start new transaction if passed', async () => {
      const people = [mockOwner]

      const mockAddress = {
        id: 1,
        address_line_1: 'Address 1',
        address_line_2: 'Address 2',
        town: 'Town',
        postcode: 'Postcode'
      }

      sequelize.models.person.count.mockResolvedValue(0)

      sequelize.models.person.create.mockResolvedValue({
        dataValues: {
          id: 1,
          first_name: 'First',
          last_name: 'Last'
        }
      })

      sequelize.models.address.create.mockResolvedValue({ ...mockAddress })

      sequelize.models.address.findByPk.mockResolvedValue({ ...mockAddress })

      sequelize.models.contact.create.mockResolvedValue({
        id: 555
      })

      await createPeople(people, {})

      expect(sequelize.transaction).toHaveBeenCalledTimes(0)
    })

    test('createPeople should return created people', async () => {
      const people = [mockEnhancedOwner]

      const mockAddress = {
        id: 1,
        address_line_1: 'Address 1',
        address_line_2: 'Address 2',
        town: 'Town',
        postcode: 'Postcode'
      }
      sequelize.models.person.count.mockResolvedValue(0)
      sequelize.models.person.create.mockResolvedValue({
        dataValues: {
          id: 1,
          first_name: 'First',
          last_name: 'Last'
        }
      })

      sequelize.models.address.create.mockResolvedValue({ ...mockAddress })

      sequelize.models.address.findByPk.mockResolvedValue({ ...mockAddress })

      const createdPeople = await createPeople(people, {})

      expect(createdPeople).toEqual([
        {
          id: 1,
          first_name: 'First',
          last_name: 'Last',
          address: {
            id: 1,
            address_line_1: 'Address 1',
            address_line_2: 'Address 2',
            town: 'Town',
            postcode: 'Postcode'
          }
        }
      ])
    })

    test('createPeople should return created people with birthDate', async () => {
      const { dateOfBirth, ...ownerWithBirthDate } = mockEnhancedOwner
      const people = [{ ...ownerWithBirthDate, birthDate: dateOfBirth }]

      const mockAddress = {
        id: 1,
        address_line_1: 'Address 1',
        address_line_2: 'Address 2',
        town: 'Town',
        postcode: 'Postcode'
      }
      sequelize.models.person.count.mockResolvedValue(0)
      sequelize.models.person.create.mockResolvedValue({
        dataValues: {
          id: 1,
          first_name: 'First',
          last_name: 'Last'
        }
      })

      sequelize.models.address.create.mockResolvedValue({ ...mockAddress })

      sequelize.models.address.findByPk.mockResolvedValue({ ...mockAddress })

      const createdPeople = await createPeople(people, {})

      expect(createdPeople).toEqual([
        {
          id: 1,
          first_name: 'First',
          last_name: 'Last',
          address: {
            id: 1,
            address_line_1: 'Address 1',
            address_line_2: 'Address 2',
            town: 'Town',
            postcode: 'Postcode'
          }
        }
      ])
    })

    test('createPeople should create new person with different PK given PK collision', async () => {
      const transaction = {
        rollback: jest.fn()
      }
      const people = [mockEnhancedOwner]

      const mockAddress = {
        id: 1,
        address_line_1: 'Address 1',
        address_line_2: 'Address 2',
        town: 'Town',
        postcode: 'Postcode'
      }

      sequelize.models.person.count
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(0)

      sequelize.models.person.create
        .mockResolvedValueOnce({
          dataValues: {
            id: 1,
            first_name: 'First',
            last_name: 'Last',
            person_reference: 'P-1C1B-EA38'
          }
        })

      sequelize.models.address.create.mockResolvedValue({ ...mockAddress })

      sequelize.models.address.findByPk.mockResolvedValue({ ...mockAddress })

      const createdPeople = await createPeople(people, transaction, {})

      expect(sequelize.models.person.count).toBeCalledTimes(3)
      expect(createdPeople).toEqual([
        {
          id: 1,
          first_name: 'First',
          last_name: 'Last',
          person_reference: 'P-1C1B-EA38',
          address: {
            id: 1,
            address_line_1: 'Address 1',
            address_line_2: 'Address 2',
            town: 'Town',
            postcode: 'Postcode'
          }
        }
      ])
    })

    test('createPeople should throw if error', async () => {
      const people = [mockEnhancedOwner]

      sequelize.models.person.create.mockRejectedValue(new Error('Test error'))

      await expect(createPeople(people, {})).rejects.toThrow('Test error')
    })
  })

  describe('getPersonByReference', () => {
    test('getPersonByReference should return person', async () => {
      sequelize.models.person.findAll.mockResolvedValue([{
        dataValues: {
          id: 1,
          first_name: 'First',
          last_name: 'Last',
          person_reference: '1234',
          addresses: [
            {
              id: 1,
              address_line_1: 'Address 1',
              address_line_2: 'Address 2',
              town: 'Town',
              postcode: 'Postcode',
              country: {
                id: 1,
                country: 'England'
              }
            }
          ]
        }
      }])

      const person = await getPersonByReference('1234')

      expect(person).toEqual({
        dataValues: {
          id: 1,
          first_name: 'First',
          last_name: 'Last',
          person_reference: '1234',
          addresses: [
            {
              id: 1,
              address_line_1: 'Address 1',
              address_line_2: 'Address 2',
              town: 'Town',
              postcode: 'Postcode',
              country: {
                id: 1,
                country: 'England'
              }
            }
          ]
        }
      })
    })

    test('getPersonByReference should throw if error', async () => {
      sequelize.models.person.findAll.mockRejectedValue(new Error('Test error'))

      await expect(getPersonByReference('1234')).rejects.toThrow('Test error')
    })
  })

  describe('getPersonAndDogsByReference', () => {
    test('getPersonAndDogsByReference should return person and dogs', async () => {
      sequelize.models.registered_person.findAll.mockResolvedValue([{
        dataValues: {
          person: [
            {
              id: 1,
              first_name: 'First',
              last_name: 'Last',
              person_reference: '1234',
              addresses: [
                {
                  id: 1,
                  address_line_1: 'Address 1',
                  address_line_2: 'Address 2',
                  town: 'Town',
                  postcode: 'Postcode'
                }
              ],
              dog: [
                { id: 1, name: 'dog1' }
              ]
            },
            {
              id: 1,
              first_name: 'First',
              last_name: 'Last',
              person_reference: '1234',
              addresses: [
                {
                  id: 1,
                  address_line_1: 'Address 1',
                  address_line_2: 'Address 2',
                  town: 'Town',
                  postcode: 'Postcode'
                }
              ],
              dog: [
                { id: 2, name: 'dog2' }
              ]
            }
          ]
        }
      }])

      const personAndDogs = await getPersonAndDogsByReference('P-1234')

      expect(personAndDogs).toEqual([{
        dataValues: {
          person: [
            {
              id: 1,
              first_name: 'First',
              last_name: 'Last',
              person_reference: '1234',
              addresses: [
                {
                  id: 1,
                  address_line_1: 'Address 1',
                  address_line_2: 'Address 2',
                  town: 'Town',
                  postcode: 'Postcode'
                }
              ],
              dog: [
                { id: 1, name: 'dog1' }
              ]
            },
            {
              id: 1,
              first_name: 'First',
              last_name: 'Last',
              person_reference: '1234',
              addresses: [
                {
                  id: 1,
                  address_line_1: 'Address 1',
                  address_line_2: 'Address 2',
                  town: 'Town',
                  postcode: 'Postcode'
                }
              ],
              dog: [
                { id: 2, name: 'dog2' }
              ]
            }
          ]
        }
      }])
    })

    test('getPersonAndDogsByReference handles owner with no dogs', async () => {
      sequelize.models.registered_person.findAll.mockResolvedValue([])
      sequelize.models.person.findAll.mockResolvedValue([
        {
          id: 1,
          first_name: 'First',
          last_name: 'Last',
          person_reference: '1234',
          addresses: [
            {
              id: 1,
              address_line_1: 'Address 1',
              address_line_2: 'Address 2',
              town: 'Town',
              postcode: 'Postcode'
            }
          ]
        }
      ])

      const personAndDogs = await getPersonAndDogsByReference('P-1234')

      expect(personAndDogs).toEqual(
        [
          {
            person: {
              id: 1,
              first_name: 'First',
              last_name: 'Last',
              person_reference: '1234',
              addresses: [
                {
                  id: 1,
                  address_line_1: 'Address 1',
                  address_line_2: 'Address 2',
                  town: 'Town',
                  postcode: 'Postcode'
                }
              ]
            },
            dog: null
          }])
    })

    test('getPersonAndDogsByReference should throw if error', async () => {
      sequelize.models.registered_person.findAll.mockRejectedValue(new Error('Test error'))

      await expect(getPersonAndDogsByReference('P-1234')).rejects.toThrow('Test error')
    })
  })

  describe('getPersonAndDogsByIndex', () => {
    test('should return person with dogs', async () => {
      sequelize.models.registered_person.findAll.mockResolvedValue([{
        dataValues: {
          person: {
            id: 1,
            first_name: 'First',
            last_name: 'Last',
            person_reference: '1234',
            addresses: [
              {
                id: 1,
                address_line_1: 'Address 1',
                address_line_2: 'Address 2',
                town: 'Town',
                postcode: 'Postcode'
              }
            ],
            registered_people: [
              {
                dog: [
                  { id: 1, name: 'dog1' }
                ]
              },
              {
                dog: [
                  { id: 2, name: 'dog2' }
                ]
              }
            ]
          },
          dog: { id: 1, name: 'dog1' }
        }
      }])

      const personAndDogs = await getPersonAndDogsByIndex('ED300719')

      expect(personAndDogs).toEqual({
        dataValues: {
          person: {
            id: 1,
            first_name: 'First',
            last_name: 'Last',
            person_reference: '1234',
            addresses: [
              {
                id: 1,
                address_line_1: 'Address 1',
                address_line_2: 'Address 2',
                town: 'Town',
                postcode: 'Postcode'
              }
            ],
            registered_people: [
              {
                dog: [
                  { id: 1, name: 'dog1' }
                ]
              },
              {
                dog: [
                  { id: 2, name: 'dog2' }
                ]
              }
            ]
          },
          dog: { id: 1, name: 'dog1' }
        }
      })
    })

    test('should throw if error', async () => {
      sequelize.models.registered_person.findAll.mockRejectedValue(new Error('Test error'))

      await expect(getPersonAndDogsByIndex('ED300001')).rejects.toThrow('Test error')
    })
  })

  describe('getOwnerOfDog', () => {
    test('getOwnerOfDog should return person', async () => {
      sequelize.models.registered_person.findOne.mockResolvedValue({
        person: {
          dataValues: {
            id: 1,
            first_name: 'First',
            last_name: 'Last',
            person_reference: '1234'
          }
        }
      })

      const person = await getOwnerOfDog('1234')

      expect(person).toEqual({
        person: {
          dataValues: {
            id: 1,
            first_name: 'First',
            last_name: 'Last',
            person_reference: '1234'
          }
        }
      })
    })

    test('getOwnerOfDog should return person with dogs', async () => {
      sequelize.models.registered_person.findOne.mockResolvedValue({
        person: {
          dataValues: {
            id: 1,
            first_name: 'First',
            last_name: 'Last',
            person_reference: '1234',
            dog: [
              { id: 1, name: 'dog1' }
            ]
          }
        }
      })

      const person = await getOwnerOfDog('1234', true)

      expect(person).toEqual({
        person: {
          dataValues: {
            id: 1,
            first_name: 'First',
            last_name: 'Last',
            person_reference: '1234',
            dog: [
              { id: 1, name: 'dog1' }
            ]
          }
        }
      })
    })

    test('getOwnerOfDog should throw when DB error', async () => {
      sequelize.models.registered_person.findOne.mockRejectedValue(new Error('Test error'))

      await expect(getOwnerOfDog('ED1234')).rejects.toThrow('Test error')
    })
  })

  describe('updatePerson', () => {
    test('updatePerson should start new transaction if none passed', async () => {
      updateSearchIndexPerson.mockResolvedValue()

      const person = {
        personReference: '1234',
        firstName: 'First',
        lastName: 'Last',
        dateOfBirth: '1990-01-01',
        address: {
          addressLine1: 'Address 1',
          addressLine2: 'Address 2',
          town: 'Town',
          postcode: 'Postcode',
          country: 'England'
        }
      }

      sequelize.models.person.findAll.mockResolvedValue([{
        id: 1,
        first_name: 'First',
        last_name: 'Last',
        person_reference: '1234',
        addresses: [
          {
            address: {
              id: 1,
              address_line_1: 'Address 1',
              address_line_2: 'Address 2',
              town: 'Town',
              postcode: 'Postcode',
              country: { country: 'England' }
            }
          }
        ],
        person_contacts: []
      }])

      await updatePerson(person, dummyUser)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('updatePerson should not start new transaction if passed', async () => {
      updateSearchIndexPerson.mockResolvedValue()

      const person = {
        personReference: '1234',
        firstName: 'First',
        lastName: 'Last',
        dateOfBirth: '1990-01-01',
        address: {
          addressLine1: 'Address 1',
          addressLine2: 'Address 2',
          town: 'Town',
          postcode: 'Postcode',
          country: 'England'
        }
      }

      sequelize.models.person.findAll.mockResolvedValue([{
        id: 1,
        first_name: 'First',
        last_name: 'Last',
        person_reference: '1234',
        addresses: [
          {
            address: {
              id: 1,
              address_line_1: 'Address 1',
              address_line_2: 'Address 2',
              town: 'Town',
              postcode: 'Postcode',
              country: { country: 'England' }
            }
          }
        ],
        person_contacts: []
      }])

      await updatePerson(person, dummyUser, {})

      expect(sequelize.transaction).toHaveBeenCalledTimes(0)
    })

    test('updatePerson change in address should create new entry', async () => {
      updateSearchIndexPerson.mockResolvedValue()

      const person = {
        personReference: '1234',
        firstName: 'First',
        lastName: 'Last',
        dateOfBirth: '1990-01-01',
        address: {
          addressLine1: 'Address 1',
          addressLine2: 'Address 2',
          town: 'New Town',
          postcode: 'Postcode',
          country: 'England'
        }
      }

      sequelize.models.person.findAll.mockResolvedValue([{
        id: 1,
        first_name: 'First',
        last_name: 'Last',
        person_reference: '1234',
        addresses: [
          {
            address: {
              id: 1,
              address_line_1: 'Address 1',
              address_line_2: 'Address 2',
              town: 'Town',
              postcode: 'Postcode',
              country: { id: 1, country: 'England' }
            }
          }
        ],
        person_contacts: []
      }])

      sequelize.models.address.findByPk.mockResolvedValue({
        id: 1,
        address_line_1: 'Address 1',
        address_line_2: 'Address 2',
        town: 'Town',
        postcode: 'Postcode',
        country: { id: 1, country: 'England' }
      })

      sequelize.models.address.create.mockResolvedValue({
        id: 2,
        address_line_1: 'Address 1',
        address_line_2: 'Address 2',
        town: 'Town',
        postcode: 'Postcode',
        country: { id: 1, country: 'England' }
      })

      await updatePerson(person, dummyUser, {})

      expect(sequelize.models.address.create).toHaveBeenCalledTimes(1)
    })

    test('updatePerson no change in address should not create new entry', async () => {
      updateSearchIndexPerson.mockResolvedValue()

      const person = {
        personReference: '1234',
        firstName: 'First',
        lastName: 'Last',
        dateOfBirth: '1990-01-01',
        address: {
          addressLine1: 'Address 1',
          addressLine2: 'Address 2',
          town: 'Town',
          postcode: 'Postcode',
          country: 'England'
        }
      }

      sequelize.models.person.findAll.mockResolvedValue([{
        id: 1,
        first_name: 'First',
        last_name: 'Last',
        person_reference: '1234',
        addresses: [
          {
            address: {
              id: 1,
              address_line_1: 'Address 1',
              address_line_2: 'Address 2',
              town: 'Town',
              postcode: 'Postcode',
              country: { id: 1, country: 'England' }
            }
          }
        ],
        person_contacts: []
      }])

      sequelize.models.address.findByPk.mockResolvedValue({
        id: 1,
        address_line_1: 'Address 1',
        address_line_2: 'Address 2',
        town: 'Town',
        postcode: 'Postcode',
        country: { id: 1, country: 'England' }
      })

      await updatePerson(person, dummyUser, {})

      expect(sequelize.models.address.create).not.toHaveBeenCalled()
    })

    test('updatePerson change in email should create new entry', async () => {
      updateSearchIndexPerson.mockResolvedValue()

      const person = {
        personReference: '1234',
        firstName: 'First',
        lastName: 'Last',
        dateOfBirth: '1990-01-01',
        address: {
          addressLine1: 'Address 1',
          addressLine2: 'Address 2',
          town: 'Town',
          postcode: 'Postcode',
          country: 'England'
        },
        email: 'test_3@example.com'
      }

      sequelize.models.person.findAll.mockResolvedValue([{
        id: 1,
        first_name: 'First',
        last_name: 'Last',
        person_reference: '1234',
        addresses: [
          {
            address: {
              id: 1,
              address_line_1: 'Address 1',
              address_line_2: 'Address 2',
              town: 'Town',
              postcode: 'Postcode',
              country: { id: 1, country: 'England' }
            }
          }
        ],
        person_contacts: [
          {
            contact: {
              id: 2,
              contact: 'test2@example.com',
              contact_type: { id: 2, contact_type: 'Email' }
            }
          },
          {
            contact: {
              id: 1,
              contact: 'test@example.com',
              contact_type: { id: 1, contact_type: 'Email' }
            }
          }
        ]
      }])

      sequelize.models.contact.create.mockResolvedValue({
        id: 2,
        contact: 'test_3@example.com'
      })

      sequelize.models.person_contact.create.mockResolvedValue({
        id: 2,
        person_id: 1,
        contact_id: 2
      })

      await updatePerson(person, dummyUser, {})

      expect(sequelize.models.contact.create).toHaveBeenCalledTimes(1)
    })

    test('updatePerson should call hasForceChanged if flag is true', async () => {
      updateSearchIndexPerson.mockResolvedValue()

      const person = {
        personReference: '1234',
        firstName: 'First',
        lastName: 'Last',
        dateOfBirth: '1990-01-01',
        address: {
          addressLine1: 'Address 1',
          addressLine2: 'Address 2',
          town: 'Town',
          postcode: 'Postcode',
          country: 'England'
        },
        email: 'test_3@example.com'
      }

      sequelize.models.person.findAll.mockResolvedValue([{
        id: 1,
        first_name: 'First',
        last_name: 'Last',
        person_reference: '1234',
        addresses: [
          {
            address: {
              id: 1,
              address_line_1: 'Address 1 changed',
              address_line_2: 'Address 2',
              town: 'Town',
              postcode: 'Postcode changed',
              country: { id: 1, country: 'England' }
            }
          }
        ],
        person_contacts: [
          {
            contact: {
              id: 2,
              contact: 'test2@example.com',
              contact_type: { id: 2, contact_type: 'Email' }
            }
          },
          {
            contact: {
              id: 1,
              contact: 'test@example.com',
              contact_type: { id: 1, contact_type: 'Email' }
            }
          }
        ]
      }])

      sequelize.models.contact.create.mockResolvedValue({
        id: 2,
        contact: 'test_3@example.com'
      })

      sequelize.models.person_contact.create.mockResolvedValue({
        id: 2,
        person_id: 1,
        contact_id: 2
      })

      await updatePerson(person, dummyUser, {}, true)

      expect(sequelize.models.contact.create).toHaveBeenCalledTimes(1)
      expect(hasForceChanged).toHaveBeenCalledWith(1, person, dummyUser, {})
    })

    test('updatePerson throws error if person not found', async () => {
      updateSearchIndexPerson.mockResolvedValue()

      sequelize.models.person.findAll.mockResolvedValue([])

      await expect(updatePerson({ personReference: 'invalid' }, 'dummy-username', {})).rejects.toThrow('Person not found')
    })

    test('updatePerson throws error if no username passed to auditing', async () => {
      updateSearchIndexPerson.mockResolvedValue()

      const person = {
        personReference: '1234',
        firstName: 'First',
        lastName: 'Last',
        dateOfBirth: '1990-01-01',
        address: {
          addressLine1: 'Address 1',
          addressLine2: 'Address 2',
          town: 'Town',
          postcode: 'Postcode',
          country: 'England'
        },
        email: 'test_3@example.com'
      }

      sequelize.models.person.findAll.mockResolvedValue([
        {
          id: 1,
          first_name: 'First',
          last_name: 'Last',
          person_reference: '1234',
          addresses: [
            {
              address: {
                id: 1,
                address_line_1: 'Address 1',
                address_line_2: 'Address 2',
                town: 'Town',
                postcode: 'Postcode',
                country: { id: 1, country: 'England' }
              }
            }
          ],
          person_contacts: [
            {
              contact: {
                id: 1,
                contact: 'test@example.com',
                contact_type: { id: 2, contact_type: 'Email' }
              }
            }
          ]
        }
      ])

      await expect(updatePerson(person, null, {})).rejects.toThrow('Username and displayname are required for auditing update of person')
    })
  })

  describe('updatePersonFields', () => {
    test('updatePersonFields should start new transaction if none passed', async () => {
      updateSearchIndexPerson.mockResolvedValue()

      const updateMock = jest.fn()
      const saveMock = jest.fn()
      const reloadMock = jest.fn()

      const personMock = {
        id: 1,
        first_name: 'First',
        last_name: 'Last',
        person_reference: '1234',
        addresses: [
          {
            address: {
              id: 1,
              address_line_1: 'Address 1',
              address_line_2: 'Address 2',
              town: 'Town',
              postcode: 'Postcode',
              country: { id: 1, country: 'England' }
            }
          }
        ],
        person_contacts: []
      }

      const personModelMock = {
        update: updateMock,
        save: saveMock,
        reload: reloadMock,
        dateValues: personMock
      }

      sequelize.models.person.findByPk.mockResolvedValue(personModelMock)

      await updatePersonFields(1, {
        dateOfBirth: new Date('1990-01-01')
      }, dummyUser)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('updatePersonFields should not start new transaction if passed', async () => {
      updateSearchIndexPerson.mockResolvedValue()

      const updateMock = jest.fn()
      const saveMock = jest.fn()
      const reloadMock = jest.fn()

      const personMock = {
        id: 1,
        first_name: 'First',
        last_name: 'Last',
        person_reference: '1234',
        addresses: [
          {
            address: {
              id: 1,
              address_line_1: 'Address 1',
              address_line_2: 'Address 2',
              town: 'Town',
              postcode: 'Postcode',
              country: { id: 1, country: 'England' }
            }
          }
        ],
        person_contacts: []
      }

      const personModelMock = {
        update: updateMock,
        save: saveMock,
        reload: reloadMock,
        dateValues: personMock
      }

      sequelize.models.person.findByPk.mockResolvedValue(personModelMock)

      await updatePersonFields(1, {
        dateOfBirth: new Date('1990-01-01')
      }, dummyUser, {})

      expect(sequelize.transaction).toHaveBeenCalledTimes(0)
    })

    test('updatePersonFields change in date of birth should create new entry', async () => {
      updateSearchIndexPerson.mockResolvedValue()

      const updateMock = jest.fn()
      const saveMock = jest.fn()

      const personMock = {
        id: 1,
        first_name: 'First',
        last_name: 'Last',
        person_reference: '1234',
        addresses: [
          {
            address: {
              id: 1,
              address_line_1: 'Address 1',
              address_line_2: 'Address 2',
              town: 'Town',
              postcode: 'Postcode',
              country: { id: 1, country: 'England' }
            }
          }
        ],
        person_contacts: []
      }

      const reloadMock = jest.fn(() => {
        personMock.birth_date = new Date('1990-01-01')
      })

      const personModelMock = {
        update: updateMock,
        save: saveMock,
        reload: reloadMock,
        dataValues: personMock
      }

      sequelize.models.person.findByPk.mockResolvedValue(personModelMock)

      const person = await updatePersonFields(1, {
        dateOfBirth: new Date('1990-01-01')
      }, dummyUser, {})

      expect(personModelMock.update).toHaveBeenCalledTimes(1)
      expect(personModelMock.update).toBeCalledWith({
        birth_date: new Date('1990-01-01')
      }, expect.anything())
      expect(personModelMock.save).toHaveBeenCalledTimes(1)
      expect(reloadMock).toHaveBeenCalledTimes(1)
      expect(person.dataValues.birth_date).toEqual(new Date('1990-01-01'))
    })

    test('updatePersonFields should not call update given a non-updatable field', async () => {
      updateSearchIndexPerson.mockResolvedValue()

      const updateMock = jest.fn()
      const saveMock = jest.fn()

      const personMock = {
        id: 1,
        first_name: 'First',
        last_name: 'Last',
        person_reference: '1234',
        addresses: [
          {
            address: {
              id: 1,
              address_line_1: 'Address 1',
              address_line_2: 'Address 2',
              town: 'Town',
              postcode: 'Postcode',
              country: { id: 1, country: 'England' }
            }
          }
        ],
        person_contacts: []
      }

      const reloadMock = jest.fn(() => {
        personMock.birth_date = new Date('1990-01-01')
      })

      const personModelMock = {
        update: updateMock,
        save: saveMock,
        reload: reloadMock,
        dataValues: personMock
      }

      sequelize.models.person.findByPk.mockResolvedValue(personModelMock)

      const person = await updatePersonFields(1, {
        personReference: '1345'
      }, dummyUser, {})

      expect(personModelMock.update).not.toHaveBeenCalled()
      expect(personModelMock.save).toHaveBeenCalledTimes(0)
      expect(reloadMock).toHaveBeenCalledTimes(0)
      expect(person.dataValues.person_reference).toEqual('1234')
    })
  })

  describe('deletePerson', () => {
    test('deletePerson should start new transaction if no transaction passed', async () => {
      const destroyFnPerson = jest.fn()
      const destroyFnPersonAddress = jest.fn()
      const destroyFnAddress = jest.fn()
      const destroyFnPersonContact = jest.fn()
      const destroyFnContact = jest.fn()

      const combinedPerson = {
        person_reference: 'P-123',
        first_name: 'John',
        last_name: 'Smith',
        addresses: [
          { destroy: destroyFnPersonAddress, address_id: 1, address: { destroy: destroyFnAddress } },
          { destroy: destroyFnPersonAddress, address_id: 2, address: { destroy: destroyFnAddress } },
          { destroy: destroyFnPersonAddress, address_id: 3, address: { destroy: destroyFnAddress } }
        ],
        person_contacts: [
          { destroy: destroyFnPersonContact, contact_id: 1, contact: { destroy: destroyFnContact } },
          { destroy: destroyFnPersonContact, contact_id: 2, contact: { destroy: destroyFnContact } },
          { destroy: destroyFnPersonContact, contact_id: 3, contact: { destroy: destroyFnContact } },
          { destroy: destroyFnPersonContact, contact_id: 4, contact: { destroy: destroyFnContact } }
        ]
      }

      sequelize.models.person.findAll.mockResolvedValue([combinedPerson])
      sequelize.models.person.findOne.mockResolvedValue({ destroy: destroyFnPerson })

      await deletePerson('P-12345', dummyUser)

      expect(sequelize.transaction).toHaveBeenCalled()
    })

    test('deletePerson should not start new transaction if transaction passed', async () => {
      const destroyFnPerson = jest.fn()
      const destroyFnPersonAddress = jest.fn()
      const destroyFnAddress = jest.fn()
      const destroyFnPersonContact = jest.fn()
      const destroyFnContact = jest.fn()

      const combinedPerson = {
        person_reference: 'P-123',
        first_name: 'John',
        last_name: 'Smith',
        addresses: [
          { destroy: destroyFnPersonAddress, address_id: 1, address: { destroy: destroyFnAddress } },
          { destroy: destroyFnPersonAddress, address_id: 2, address: { destroy: destroyFnAddress } },
          { destroy: destroyFnPersonAddress, address_id: 3, address: { destroy: destroyFnAddress } }
        ],
        person_contacts: [
          { destroy: destroyFnPersonContact, contact_id: 1, contact: { destroy: destroyFnContact } },
          { destroy: destroyFnPersonContact, contact_id: 2, contact: { destroy: destroyFnContact } },
          { destroy: destroyFnPersonContact, contact_id: 3, contact: { destroy: destroyFnContact } },
          { destroy: destroyFnPersonContact, contact_id: 4, contact: { destroy: destroyFnContact } }
        ]
      }

      sequelize.models.person.findAll.mockResolvedValue([combinedPerson])
      sequelize.models.person.findOne.mockResolvedValue({ destroy: destroyFnPerson })
      await deletePerson('P-12345', dummyUser, {})

      expect(sequelize.transaction).not.toHaveBeenCalled()
    })

    test('deletePerson should make appropriate delete calls', async () => {
      const destroyFnPerson = jest.fn()
      const destroyFnPersonAddress = jest.fn()
      const destroyFnAddress = jest.fn()
      const destroyFnPersonContact = jest.fn()
      const destroyFnContact = jest.fn()

      const combinedPerson = {
        person_reference: 'P-123',
        first_name: 'John',
        last_name: 'Smith',
        addresses: [
          { destroy: destroyFnPersonAddress, address_id: 1, address: { destroy: destroyFnAddress } },
          { destroy: destroyFnPersonAddress, address_id: 2, address: { destroy: destroyFnAddress } },
          { destroy: destroyFnPersonAddress, address_id: 3, address: { destroy: destroyFnAddress } }
        ],
        person_contacts: [
          { destroy: destroyFnPersonContact, contact_id: 1, contact: { destroy: destroyFnContact } },
          { destroy: destroyFnPersonContact, contact_id: 2, contact: { destroy: destroyFnContact } },
          { destroy: destroyFnPersonContact, contact_id: 3, contact: { destroy: destroyFnContact } },
          { destroy: destroyFnPersonContact, contact_id: 4, contact: { destroy: destroyFnContact } }
        ]
      }

      sequelize.models.person.findAll.mockResolvedValue([combinedPerson])
      sequelize.models.person.findOne.mockResolvedValue({ destroy: destroyFnPerson })
      await deletePerson('P-12345', dummyUser, {})

      expect(destroyFnPerson).toHaveBeenCalledTimes(1)
      expect(destroyFnPersonAddress).toHaveBeenCalledTimes(3)
      expect(destroyFnAddress).toHaveBeenCalledTimes(3)
      expect(destroyFnPersonContact).toHaveBeenCalledTimes(4)
      expect(destroyFnContact).toHaveBeenCalledTimes(4)
      expect(sequelize.models.search_index.destroy).toHaveBeenCalledTimes(1)
      expect(sequelize.models.search_match_code.destroy).toHaveBeenCalledTimes(1)
      expect(sequelize.models.search_tgram.destroy).toHaveBeenCalledTimes(1)
    })
  })

  describe('purgePersonByReferenceNumber', () => {
    const destroyFnPerson = jest.fn()
    const destroyFnPersonAddress = jest.fn()
    const destroyFnAddress = jest.fn()
    const destroyFnPersonContact = jest.fn()
    const destroyFnContact = jest.fn()

    const combinedPerson = {
      person_reference: 'P-123',
      first_name: 'John',
      last_name: 'Smith',
      addresses: [
        { destroy: destroyFnPersonAddress, address_id: 1, address: { destroy: destroyFnAddress } },
        { destroy: destroyFnPersonAddress, address_id: 2, address: { destroy: destroyFnAddress } },
        { destroy: destroyFnPersonAddress, address_id: 3, address: { destroy: destroyFnAddress } }
      ],
      person_contacts: [
        { destroy: destroyFnPersonContact, contact_id: 1, contact: { destroy: destroyFnContact } },
        { destroy: destroyFnPersonContact, contact_id: 2, contact: { destroy: destroyFnContact } },
        { destroy: destroyFnPersonContact, contact_id: 3, contact: { destroy: destroyFnContact } },
        { destroy: destroyFnPersonContact, contact_id: 4, contact: { destroy: destroyFnContact } }
      ],
      destroy: destroyFnPerson
    }

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('purgePersonByReferenceNumber should start new transaction if no transaction passed', async () => {
      sequelize.models.person.findAll.mockResolvedValue([combinedPerson])
      await purgePersonByReferenceNumber('P-12345', dummyUser)

      expect(sequelize.transaction).toHaveBeenCalled()
    })

    test('purgePersonByReferenceNumber should not start new transaction if transaction passed', async () => {
      sequelize.models.person.findAll.mockResolvedValue([combinedPerson])
      await purgePersonByReferenceNumber('P-12345', dummyUser, {})

      expect(sequelize.transaction).not.toHaveBeenCalled()
    })

    test('purgePersonByReferenceNumber should make appropriate delete calls', async () => {
      sequelize.models.person.findAll.mockResolvedValue([combinedPerson])
      sequelize.models.person.findOne.mockResolvedValue({ destroy: destroyFnPerson })
      await purgePersonByReferenceNumber('P-12345', dummyUser, {})

      expect(sequelize.models.person.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { person_reference: 'P-12345' },
        paranoid: false
      }))
      expect(destroyFnPerson).toHaveBeenCalledWith({ force: true, transaction: {} })
      expect(destroyFnPerson).toHaveBeenCalledTimes(1)
      expect(destroyFnPersonAddress).toHaveBeenCalledWith({ force: true, transaction: {} })
      expect(destroyFnPersonAddress).toHaveBeenCalledTimes(3)
      expect(destroyFnAddress).toHaveBeenCalledWith({ force: true, transaction: {} })
      expect(destroyFnAddress).toHaveBeenCalledTimes(3)
      expect(destroyFnPersonContact).toHaveBeenCalledWith({ force: true, transaction: {} })
      expect(destroyFnPersonContact).toHaveBeenCalledTimes(4)
      expect(destroyFnContact).toHaveBeenCalledWith({ force: true, transaction: {} })
      expect(destroyFnContact).toHaveBeenCalledTimes(4)
      expect(sendEvent).toHaveBeenCalledWith({
        type: 'uk.gov.defra.ddi.event.delete.permanent',
        source: 'aphw-ddi-api',
        partitionKey: 'P-123',
        id: expect.any(String),
        subject: 'DDI Permanently delete person',
        data: {
          message: '{"actioningUser":{"username":"dummy-user","displayname":"Dummy User"},"operation":"permanently deleted person","deleted":{"personReference":"P-123"}}'
        }
      })
    })
  })

  describe('updatePersonEmail', () => {
    test('should update a person email', async () => {
      const personReference = 'P-DA08-8028'
      const email = 'garrymcfadyen@hotmail.com'
      const person = await updatePersonEmail(personReference, email, dummyUser, {})
      expect(person).toEqual(new Error('To be implemented'))
    })
  })
})
