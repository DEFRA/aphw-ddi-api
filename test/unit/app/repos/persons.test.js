const { when } = require('jest-when')

jest.mock('../../../../app/messaging/send-event')
const { sendEvent } = require('../../../../app/messaging/send-event')
const { NotFoundError } = require('../../../../app/errors/not-found')

describe('Persons repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      person: {
        create: jest.fn(),
        findOne: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn()
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
    transaction: jest.fn(),
    fn: jest.fn(),
    where: jest.fn(),
    literal: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')
  const { Op } = require('sequelize')

  jest.mock('../../../../app/lookups')
  const { getContactType, getCountry } = require('../../../../app/lookups')

  jest.mock('../../../../app/repos/people')
  const { deletePerson } = require('../../../../app/repos/people')

  const { getPersons, deletePersons } = require('../../../../app/repos/persons')

  const dummyUser = {
    username: 'dummy-user',
    displayname: 'Dummy User'
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    when(getContactType).calledWith('Phone').mockResolvedValue({ id: 1 })
    when(getContactType).calledWith('Email').mockResolvedValue({ id: 2 })
    when(getContactType).calledWith('SecondaryPhone').mockResolvedValue({ id: 3 })

    when(getCountry).calledWith('England').mockResolvedValue({ id: 1 })
    when(getCountry).calledWith('Wales').mockResolvedValue({ id: 2 })

    sequelize.models.person.findAll.mockResolvedValue([])
    sendEvent.mockResolvedValue()
  })

  describe('getPersons', () => {
    test('getPersons should use a transaction if one is passed', async () => {
      const transaction = jest.fn()
      await getPersons({}, {}, transaction)
      expect(sequelize.models.person.findAll).toBeCalledWith(expect.objectContaining({
        transaction
      }))
    })

    test('getPersons should return created people limited to 20 given no query params are passed', async () => {
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

      const gotPersons = await getPersons({})

      expect(gotPersons).toEqual([
        {
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
        }
      ])

      expect(sequelize.models.person.findAll).toBeCalledWith(expect.objectContaining({
        limit: 20,
        where: {}
      }))
    })

    test('getPersons should return up to 30 created people given query parameters are passed and limit is set', async () => {
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

      await getPersons({
        firstName: 'John',
        lastName: 'Smith',
        dateOfBirth: '2000-01-01'
      }, { limit: 30 })

      expect(sequelize.models.person.findAll).toBeCalledWith(expect.objectContaining({
        limit: 30
      }))
    })

    test('getPersons should sort by last name and first name ASC given owner key is set', async () => {
      sequelize.models.person.findAll.mockResolvedValue([])
      sequelize.col.mockImplementation(col => col)

      await getPersons({
        orphaned: true
      }, { sortKey: 'owner' })

      expect(sequelize.col.mock.calls[0]).toEqual(['last_name'])
      expect(sequelize.col.mock.calls[1]).toEqual(['first_name'])
      expect(sequelize.models.person.findAll).toBeCalledWith(expect.objectContaining({
        order: [
          ['last_name', 'ASC'],
          ['first_name', 'ASC']
        ]
      }))
    })

    test('getPersons should sort by last name and first name ASC given owner key is set', async () => {
      sequelize.models.person.findAll.mockResolvedValue([])
      sequelize.col.mockImplementation(col => col)

      await getPersons({
        orphaned: true
      }, { sortKey: 'owner', sortOrder: 'DESC' })

      expect(sequelize.col.mock.calls[0]).toEqual(['last_name'])
      expect(sequelize.col.mock.calls[1]).toEqual(['first_name'])
      expect(sequelize.models.person.findAll).toBeCalledWith(expect.objectContaining({
        order: [
          ['last_name', 'DESC'],
          ['first_name', 'DESC']
        ]
      }))
    })

    test('getPersons should sort by birth_date ASC given birthDate is set', async () => {
      sequelize.models.person.findAll.mockResolvedValue([])
      sequelize.col.mockImplementation(col => col)

      await getPersons({
        orphaned: true
      }, { sortKey: 'birthDate', sortOrder: 'DESC' })

      expect(sequelize.col.mock.calls[0]).toEqual(['birth_date'])
      expect(sequelize.models.person.findAll).toBeCalledWith(expect.objectContaining({
        order: [
          ['birth_date', 'DESC']
        ]
      }))
    })

    test('getPersons should sort by address DESC given address is set', async () => {
      sequelize.models.person.findAll.mockResolvedValue([])
      sequelize.col.mockImplementation(col => col)

      await getPersons({
        orphaned: true
      }, { sortKey: 'address', sortOrder: 'DESC' })

      expect(sequelize.col.mock.calls[0]).toEqual(['addresses.address.address_line_1'])
      expect(sequelize.models.person.findAll).toBeCalledWith(expect.objectContaining({
        order: [
          ['addresses.address.address_line_1', 'DESC']
        ]
      }))
    })

    test('getPersons should return unlimited number of orphaned owner given orphaned=true is passed and limit is set to -1', async () => {
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

      await getPersons({
        orphaned: true
      }, { limit: -1 })

      expect(sequelize.models.person.findAll).toBeCalledWith(expect.objectContaining({
        include: expect.arrayContaining([expect.objectContaining({
          model: sequelize.models.registered_person,
          as: 'registered_people'
        })]),
        where: {
          '$registered_people.dog_id$': {
            [Op.is]: null
          }
        }
      }))

      expect(sequelize.models.person.findAll).not.toHaveBeenCalledWith(expect.objectContaining({
        limit: expect.anything()
      }))
    })

    test('getPersons should throw if error', async () => {
      sequelize.models.person.findAll.mockRejectedValue(new Error('Test error'))

      await expect(getPersons({})).rejects.toThrow('Test error')
    })
  })

  describe('deletePersons', () => {
    test('should successfully delete people', async () => {
      const personsToDelete = ['P-1234-567', 'P-2345-678']
      const response = await deletePersons(personsToDelete, dummyUser)

      expect(response).toEqual({
        count: {
          failed: 0,
          success: 2
        },
        deleted: {
          failed: [],
          success: ['P-1234-567', 'P-2345-678']
        }
      })

      expect(deletePerson.mock.calls[0]).toEqual(['P-1234-567', dummyUser])
      expect(deletePerson.mock.calls[1]).toEqual(['P-2345-678', dummyUser])
    })

    test('should handle delete failures', async () => {
      deletePerson.mockRejectedValueOnce(new NotFoundError('Person does not exist'))
      const personsToDelete = ['P-1234-567', 'P-2345-678']
      const response = await deletePersons(personsToDelete, dummyUser)

      expect(response).toEqual({
        count: {
          failed: 1,
          success: 1
        },
        deleted: {
          failed: ['P-1234-567'],
          success: ['P-2345-678']
        }
      })
    })
  })
})
