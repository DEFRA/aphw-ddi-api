const { uniqueResults: mockUniqueResults, resultsForGrouping: mockResultsForGrouping } = require('../../../mocks/search-results')

describe('SearchBasic repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      search_index: {
        findAll: jest.fn()
      }
    },
    fn: jest.fn(),
    literal: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  const { search } = require('../../../../app/register/search-basic')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('search for dogs should return empty array if no terms', async () => {
    sequelize.models.search_index.findAll.mockResolvedValue(mockUniqueResults)

    const results = await search()
    expect(results.length).toBe(0)
  })

  test('search for dogs should return array of unique results', async () => {
    sequelize.models.search_index.findAll.mockResolvedValue(mockUniqueResults)

    const results = await search('dog', 'term1')
    expect(results.length).toBe(3)
    expect(results[0].firstName).toBe('John')
    expect(results[0].dogId).toBe(1)
    expect(results[0].personId).toBe(11)
    expect(results[2].firstName).toBe('Mark')
    expect(results[2].dogId).toBe(3)
    expect(results[2].personId).toBe(33)
  })

  test('search for owners with many dogs should return many dogs under owner', async () => {
    sequelize.models.search_index.findAll.mockResolvedValue(mockResultsForGrouping)

    const results = await search('owner', 'john term2')
    expect(results.length).toBe(2)
    expect(results[0].firstName).toBe('John')
    expect(results[0].dogs.length).toBe(2)
    expect(results[0].personId).toBe(11)
    expect(results[0].dogs[0].dogName).toBe('Bruno')
    expect(results[0].dogs[0].dogId).toBe(1)
    expect(results[0].dogs[1].dogName).toBe('Fido')
    expect(results[0].dogs[1].dogId).toBe(3)

    expect(results[1].firstName).toBe('Peter')
    expect(results[1].dogs[0].dogId).toBe(2)
    expect(results[1].personId).toBe(22)
  })

  test('search for owner should return empty array when no owners', async () => {
    sequelize.models.search_index.findAll.mockResolvedValue([])

    const results = await search('owner', 'term1')
    expect(results.length).toBe(0)
  })
})
