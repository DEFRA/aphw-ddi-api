const { owner: mockOwner } = require('../../../mocks/cdo/create')

describe('People repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      person: {
        create: jest.fn()
      },
      address: {
        create: jest.fn(),
        findByPk: jest.fn()
      },
      person_address: {
        create: jest.fn()
      }
    },
    transaction: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  const { createPeople } = require('../../../../app/repos/people')

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
})
