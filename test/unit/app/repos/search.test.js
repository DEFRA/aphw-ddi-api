jest.mock('../../../../app/repos/dogs')
const { getDogByIndexNumber } = require('../../../../app/repos/dogs')

describe('Search repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      search_index: {
        create: jest.fn(),
        save: jest.fn(),
        destroy: jest.fn(),
        findAll: jest.fn()
      }
    },
    col: jest.fn(),
    transaction: jest.fn(),
    fn: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  const { addToSearchIndex, buildAddressString, updateSearchIndexDog, updateSearchIndexPerson } = require('../../../../app/repos/search')

  const { dbFindByPk } = require('../../../../app/lib/db-functions')
  jest.mock('../../../../app/lib/db-functions')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('addToSearchIndex should call create and not destroy for new dog', async () => {
    sequelize.models.search_index.create.mockResolvedValue()
    getDogByIndexNumber.mockResolvedValue({ id: 1, index_number: 'ED1' })

    const person = {
      id: 123,
      firstName: 'John',
      lastName: 'Smith',
      dogIndex: 123,
      address: {
        address_line_1: '123 some address'
      }
    }

    const dog = {
      id: 456,
      dogName: 'Bruno',
      microchipNumber: 123456789012345
    }

    dbFindByPk.mockResolvedValue(dog)

    await addToSearchIndex(person, dog, {})

    expect(sequelize.models.search_index.create).toHaveBeenCalledTimes(1)
    expect(sequelize.models.search_index.destroy).not.toHaveBeenCalled()
  })

  test('addToSearchIndex should call destroy for existing dog', async () => {
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
      existingDog: true,
      microchipNumber: 123456789012345
    }

    dbFindByPk.mockResolvedValue(dog)

    await addToSearchIndex(person, dog, {})

    expect(sequelize.models.search_index.create).toHaveBeenCalledTimes(1)
    expect(sequelize.models.search_index.destroy).toHaveBeenCalledTimes(1)
  })

  test('addToSearchIndex should create new transaction if none passed', async () => {
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
      existingDog: true,
      microchipNumber: 123456789012345
    }

    dbFindByPk.mockResolvedValue(dog)

    await addToSearchIndex(person, dog)

    expect(sequelize.transaction).toHaveBeenCalledTimes(1)
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

  test('UpdateSearchIndexDog should call search_index save for each row', async () => {
    const mockSave = jest.fn()
    sequelize.models.search_index.findAll.mockResolvedValue([
      { dog_id: 1, person_id: 1, search: '12345', json: '{ dogName: \'Bruno\' }', save: mockSave },
      { dog_id: 2, person_id: 2, search: '34567', json: '{ dogName: \'Fido\' }', save: mockSave }
    ])

    const dog = {
      id: 1,
      dogIndex: 123,
      dogName: 'Bruno2',
      microchipNumber: 123456789012345
    }

    await updateSearchIndexDog(dog, {})

    expect(mockSave).toHaveBeenCalledTimes(2)
  })

  test('UpdateSearchIndexPerson should call search_index save for each row', async () => {
    const mockSave = jest.fn()
    sequelize.models.search_index.findAll.mockResolvedValue([
      { dog_id: 1, person_id: 1, search: '12345', json: '{ dogName: \'Bruno\', firstName: \'John\' }', save: mockSave }
    ])

    const person = {
      id: 1,
      dogIndex: 123,
      firstName: 'Mark',
      address: {}
    }

    await updateSearchIndexPerson(person, {})

    expect(mockSave).toHaveBeenCalledTimes(1)
  })
})
