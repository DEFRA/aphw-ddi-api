const { owner: mockOwner } = require('../../../mocks/cdo/create')

describe('People repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      person: {
        create: jest.fn(),
        findOne: jest.fn()
      },
      address: {
        create: jest.fn(),
        findByPk: jest.fn()
      },
      person_address: {
        create: jest.fn()
      },
      registered_person: {
        findAll: jest.fn()
      },
      dog: {
        findAll: jest.fn()
      }
    },
    transaction: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  const { createPeople, getPersonByReference, getPersonAndDogsByReference } = require('../../../../app/repos/people')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('createPeople should start new transaction if none passed', async () => {
    const people = [mockOwner]

    await createPeople(people)

    expect(sequelize.transaction).toHaveBeenCalledTimes(1)
  })

  test('createPeople should note start new transaction if passed', async () => {
    const people = [mockOwner]

    const mockAddress = {
      id: 1,
      address_line_1: 'Address 1',
      address_line_2: 'Address 2',
      town: 'Town',
      postcode: 'Postcode'
    }

    sequelize.models.person.create.mockResolvedValue({
      dataValues: {
        id: 1,
        first_name: 'First',
        last_name: 'Last'
      }
    })

    sequelize.models.address.create.mockResolvedValue({ ...mockAddress })

    sequelize.models.address.findByPk.mockResolvedValue({ ...mockAddress })

    await createPeople(people, {})

    expect(sequelize.transaction).not.toHaveBeenCalled()
  })

  test('createPeople should return created people', async () => {
    const people = [mockOwner]

    const mockAddress = {
      id: 1,
      address_line_1: 'Address 1',
      address_line_2: 'Address 2',
      town: 'Town',
      postcode: 'Postcode'
    }

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

  test('createPeople should throw if error', async () => {
    const people = [mockOwner]

    sequelize.models.person.create.mockRejectedValue(new Error('Test error'))

    await expect(createPeople(people, {})).rejects.toThrow('Test error')
  })

  test('getPersonByReference should return person', async () => {
    sequelize.models.person.findOne.mockResolvedValue({
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
            postcode: 'Postcode'
          }
        ]
      }
    })

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
            postcode: 'Postcode'
          }
        ]
      }
    })
  })

  test('getPersonByReference should throw if error', async () => {
    sequelize.models.person.findOne.mockRejectedValue(new Error('Test error'))

    await expect(getPersonByReference('1234')).rejects.toThrow('Test error')
  })

  test('getPersonAndDogsByReference should return person and dogs', async () => {
    sequelize.models.registered_person.findAll.mockResolvedValue({
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
            dogs: [
              { id: 1, name: 'dog1' },
              { id: 2, name: 'dog2' }
            ]
          }
        ]
      }
    })

    const personAndDogs = await getPersonAndDogsByReference('P-1234')

    expect(personAndDogs).toEqual({
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
            dogs: [
              { id: 1, name: 'dog1' },
              { id: 2, name: 'dog2' }
            ]
          }
        ]
      }
    })
  })

  test('getPersonAndDogsByReference should throw if error', async () => {
    sequelize.models.registered_person.findAll.mockRejectedValue(new Error('Test error'))

    await expect(getPersonAndDogsByReference('P-1234')).rejects.toThrow('Test error')
  })
})
