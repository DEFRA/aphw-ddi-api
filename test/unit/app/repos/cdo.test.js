const mockCdoPayload = require('../../../mocks/cdo/create')

describe('CDO repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  jest.mock('../../../../app/repos/people')
  const { createPeople } = require('../../../../app/repos/people')

  jest.mock('../../../../app/repos/dogs')
  const { createDogs, getDogByIndexNumber } = require('../../../../app/repos/dogs')

  jest.mock('../../../../app/repos/search')
  const { addToSearchIndex } = require('../../../../app/repos/search')

  const { createCdo } = require('../../../../app/repos/cdo')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('createCdo should create start new transaction if none passed', async () => {
    await createCdo(mockCdoPayload)

    expect(sequelize.transaction).toHaveBeenCalledTimes(1)
  })

  test('createCdo should create start new transaction if passed', async () => {
    const owners = [{ id: 1, ...mockCdoPayload.owner }]
    const dogs = [{ id: 1, ...mockCdoPayload.dogs[0] }]

    createPeople.mockResolvedValue(owners)
    createDogs.mockResolvedValue(dogs)
    addToSearchIndex.mockResolvedValue()
    getDogByIndexNumber.mockResolvedValue({ id: 1, index_number: 'ED1' })

    await createCdo(mockCdoPayload, {})

    expect(sequelize.transaction).not.toHaveBeenCalled()
  })

  test('createCdo should return owner and created dogs', async () => {
    const owners = [{ id: 1, ...mockCdoPayload.owner }]
    const dogs = [{ id: 1, ...mockCdoPayload.dogs[0] }]

    createPeople.mockResolvedValue(owners)
    createDogs.mockResolvedValue(dogs)
    addToSearchIndex.mockResolvedValue()
    getDogByIndexNumber.mockResolvedValue({ id: 1, index_number: 'ED1' })

    const cdo = await createCdo(mockCdoPayload, {})

    expect(cdo.owner).toEqual(owners[0])
    expect(cdo.dogs).toEqual(dogs)
  })

  test('createCdo should throw if error', async () => {
    createPeople.mockRejectedValue(new Error('Test error'))

    await expect(createCdo(mockCdoPayload, {})).rejects.toThrow('Test error')
  })
})
