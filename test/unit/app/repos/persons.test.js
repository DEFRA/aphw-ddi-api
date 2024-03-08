const { when } = require('jest-when')

jest.mock('../../../../app/messaging/send-event')
const { sendEvent } = require('../../../../app/messaging/send-event')
describe('People repo', () => {
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
    transaction: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  jest.mock('../../../../app/lookups')
  const { getContactType, getCountry } = require('../../../../app/lookups')

  const { getPersons } = require('../../../../app/repos/persons')

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

  test('getPersons should return created people', async () => {
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
  })

  test('getPersons should throw if error', async () => {
    sequelize.models.person.findAll.mockRejectedValue(new Error('Test error'))

    await expect(getPersons({})).rejects.toThrow('Test error')
  })
})
