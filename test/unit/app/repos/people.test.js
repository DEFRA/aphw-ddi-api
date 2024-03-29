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
  jest.mock('../../../../app/config/db', () => ({
    models: {
      person: {
        create: jest.fn(),
        findOne: jest.fn(),
        findAll: jest.fn(),
        findByPk: jest.fn(),
        update: jest.fn(),
        count: jest.fn()
      },
      address: {
        create: jest.fn(),
        findByPk: jest.fn()
      },
      person_address: {
        create: jest.fn()
      },
      registered_person: {
        findAll: jest.fn(),
        findOne: jest.fn()
      },
      dog: {
        findAll: jest.fn()
      },
      person_contact: {
        create: jest.fn()
      },
      contact: {
        create: jest.fn()
      }
    },
    col: jest.fn(),
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn()
    }))
  }))

  const sequelize = require('../../../../app/config/db')

  jest.mock('../../../../app/lookups')
  const { getContactType, getCountry } = require('../../../../app/lookups')

  jest.mock('../../../../app/repos/search')
  const { updateSearchIndexPerson } = require('../../../../app/repos/search')

  const { createPeople, getPersonByReference, getPersonAndDogsByReference, updatePerson, getOwnerOfDog, updatePersonFields } = require('../../../../app/repos/people')

  beforeEach(async () => {
    jest.clearAllMocks()

    when(getContactType).calledWith('Phone').mockResolvedValue({ id: 1 })
    when(getContactType).calledWith('Email').mockResolvedValue({ id: 2 })
    when(getContactType).calledWith('SecondaryPhone').mockResolvedValue({ id: 3 })

    when(getCountry).calledWith('England').mockResolvedValue({ id: 1 })
    when(getCountry).calledWith('Wales').mockResolvedValue({ id: 2 })

    sendEvent.mockResolvedValue()
  })

  describe('createPeople', () => {
    test('createPeople should start two new transactions if none passed', async () => {
      const people = [mockOwner]

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

    test('getPersonAndDogsByReference should throw if error', async () => {
      sequelize.models.registered_person.findAll.mockRejectedValue(new Error('Test error'))

      await expect(getPersonAndDogsByReference('P-1234')).rejects.toThrow('Test error')
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
        },
        email: 'test@example.com'
      }

      await updatePerson(person)

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
              id: 1,
              contact: 'test@example.com',
              contact_type: { id: 2, contact_type: 'Email' }
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

      await updatePersonFields(1, {
        dateOfBirth: new Date('1990-01-01')
      })

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
})
