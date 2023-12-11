describe('Search repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      search_index: {
        create: jest.fn()
      }
    },
    transaction: jest.fn(),
    fn: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  const { addToSearchIndex, buildAddress } = require('../../../../app/repos/search')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('addToSearchIndex should call create', async () => {
    sequelize.models.search_index.create.mockResolvedValue()

    const person = {
      id: 123,
      firstName: 'John',
      lastName: 'Smith',
      address: '123 some address'
    }

    const dog = {
      id: 456,
      dogIndex: 123,
      dogName: 'Bruno',
      microchipNumber: 123456789012345
    }

    await addToSearchIndex(person, dog, {})

    expect(sequelize.models.search_index.create).toHaveBeenCalledTimes(1)
  })

  test('buildAddress should return parts', async () => {
    const person = {
      firstName: 'John',
      lastName: 'Smith',
      addresses: {
        address: {
          address_line_1: 'addr1',
          address_line_2: 'addr2',
          town: 'town',
          postcode: 'postcode'
        }
      }
    }

    const parts = await buildAddress(person)

    expect(parts).toBe('addr1, addr2, town, postcode')
  })

  test('buildAddress should return parts', async () => {
    const person = {
      firstName: 'John',
      lastName: 'Smith',
      address: {
        address_line_1: 'addr1',
        address_line_2: 'addr2',
        town: 'town',
        postcode: 'postcode'
      }
    }

    const parts = await buildAddress(person)

    expect(parts).toBe('addr1, addr2, town, postcode')
  })
})
