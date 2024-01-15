const { when } = require('jest-when')
const { owner: mockOwner } = require('../../../mocks/cdo/create')

describe('People repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      person: {
        create: jest.fn(),
        findOne: jest.fn(),
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
        findAll: jest.fn()
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

  jest.mock('../../../../app/repos/search')
  const { updateSearchIndexPerson } = require('../../../../app/repos/search')

  const { createPeople, getPersonByReference, getPersonAndDogsByReference, updatePerson } = require('../../../../app/repos/people')

  beforeEach(async () => {
    jest.clearAllMocks()

    when(getContactType).calledWith('Phone').mockResolvedValue({ id: 1 })
    when(getContactType).calledWith('Email').mockResolvedValue({ id: 2 })
    when(getContactType).calledWith('SecondaryPhone').mockResolvedValue({ id: 3 })

    when(getCountry).calledWith('England').mockResolvedValue({ id: 1 })
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
    sequelize.models.registered_person.findAll.mockResolvedValue([{
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
    }])

    const person = await getPersonByReference('1234')

    console.log('person', JSON.parse(JSON.stringify(person)))

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
    sequelize.models.registered_person.findAll.mockRejectedValue(new Error('Test error'))

    await expect(getPersonByReference('1234')).rejects.toThrow('Test error')
  })

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
            dogs: [
              { id: 1, name: 'dog1' },
              { id: 2, name: 'dog2' }
            ]
          }
        ]
      }
    }])

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

    sequelize.models.registered_person.findAll.mockResolvedValue([{
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

    await updatePerson(person, {})

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

    sequelize.models.registered_person.findAll.mockResolvedValue([{
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

    await updatePerson(person, {})

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

    sequelize.models.registered_person.findAll.mockResolvedValue([{
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

    await updatePerson(person, {})

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

    sequelize.models.registered_person.findAll.mockResolvedValue([{
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

    await updatePerson(person, {})

    expect(sequelize.models.contact.create).toHaveBeenCalledTimes(1)
  })
})
