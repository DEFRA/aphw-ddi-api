jest.mock('../../../../app/repos/dogs')
const { getDogByIndexNumber } = require('../../../../app/repos/dogs')

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

  const { addToSearchIndex, buildAddressString } = require('../../../../app/repos/search')

  const { dbFindByPk } = require('../../../../app/lib/db-functions')
  jest.mock('../../../../app/lib/db-functions')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('addToSearchIndex should call create', async () => {
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
      microchipNumber: 123456789012345
    }

    dbFindByPk.mockResolvedValue(dog)

    await addToSearchIndex(person, dog.id, {})

    expect(sequelize.models.search_index.create).toHaveBeenCalledTimes(1)
  })

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
