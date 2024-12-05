const { uniqueResults: mockUniqueResults, resultsForGrouping: mockResultsForGrouping, resultsForSorting: mockResultsForSorting, moreThanTenResults } = require('../../../mocks/search-results')
const { devUser } = require('../../../mocks/auth')

describe('Search repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      search_index: {
        findAll: jest.fn()
      },
      search_match_code: {
        findAll: jest.fn()
      },
      search_tgram: {
        findAll: jest.fn()
      },
      user_account: {
        findOne: jest.fn()
      }
    },
    fn: jest.fn(),
    literal: jest.fn(),
    col: jest.fn(),
    where: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  const { search } = require('../../../../app/search/search')
  const { sortOwnerSearch } = require('../../../../app/search/search-processors/sorting-and-grouping')

  const mockRequest = {
    server: {
      app: {
        cache: {
          set: jest.fn(),
          get: jest.fn()
        }
      }
    }
  }

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('search for dogs should return empty array if no terms', async () => {
    sequelize.models.search_index.findAll.mockResolvedValue(mockUniqueResults)

    const results = await search(mockRequest, devUser)
    expect(results.results.length).toBe(0)
    expect(results.totalFound).toBe(0)
  })

  test('search for dogs should return array of unique results for standard search', async () => {
    sequelize.models.search_index.findAll.mockResolvedValue(mockUniqueResults)

    const results = await search(mockRequest, devUser, 'dog', 'john peter mark')
    expect(results.results.length).toBe(3)
    expect(results.totalFound).toBe(3)
    expect(results.results[0].firstName).toBe('John')
    expect(results.results[0].dogId).toBe(1)
    expect(results.results[0].personId).toBe(11)
    expect(results.results[2].firstName).toBe('Mark')
    expect(results.results[2].dogId).toBe(3)
    expect(results.results[2].personId).toBe(33)
  })

  test('search for owners with many dogs should return many dogs under owner', async () => {
    sequelize.models.search_index.findAll.mockResolvedValue(mockResultsForGrouping)

    const results = await search(mockRequest, devUser, 'owner', 'john peter mark')
    expect(results.totalFound).toBe(2)
    expect(results.results.length).toBe(2)
    expect(results.results[0].firstName).toBe('Peter')
    expect(results.results[0].dogs.length).toBe(1)
    expect(results.results[0].personId).toBe(22)
    expect(results.results[0].dogs[0].dogName).toBe('Butch')
    expect(results.results[0].dogs[0].dogId).toBe(2)

    expect(results.results[1].firstName).toBe('John')
    expect(results.results[1].dogs.length).toBe(2)
    expect(results.results[1].dogs[0].dogId).toBe(1)
    expect(results.results[1].personId).toBe(11)
    expect(results.results[1].dogs[0].dogName).toBe('Bruno')
    expect(results.results[1].dogs[0].dogId).toBe(1)
    expect(results.results[1].dogs[1].dogName).toBe('Fido')
    expect(results.results[1].dogs[1].dogId).toBe(3)
  })

  test('search for owner should return empty array when no owners', async () => {
    sequelize.models.search_index.findAll.mockResolvedValue([])

    const results = await search(mockRequest, devUser, 'owner', 'term1')
    expect(results.results.length).toBe(0)
    expect(results.totalFound).toBe(0)
  })

  test('search for owner should adjust threshold if more than 10 results in first pass', async () => {
    sequelize.models.search_index.findAll.mockResolvedValue(moreThanTenResults)
    sequelize.models.search_match_code.findAll.mockResolvedValue([])
    sequelize.models.search_tgram.findAll.mockResolvedValue([])

    const results = await search(mockRequest, devUser, 'owner', 'smith')
    expect(results.results.length).toBe(11)
    expect(results.totalFound).toBe(11)
  })

  test('search for microchip only should adjust threshold when fuzzy', async () => {
    sequelize.models.search_index.findAll.mockResolvedValue(moreThanTenResults)
    sequelize.models.search_match_code.findAll.mockResolvedValue([])
    sequelize.models.search_tgram.findAll.mockResolvedValue([])

    const results = await search(mockRequest, devUser, 'dog', '123451234512345', true)
    expect(results.results.length).toBe(0)
    expect(results.totalFound).toBe(0)
  })

  test('search for microchip and other terms should not adjust threshold when fuzzy', async () => {
    sequelize.models.search_index.findAll.mockResolvedValue(moreThanTenResults)
    sequelize.models.search_match_code.findAll.mockResolvedValue([])
    sequelize.models.search_tgram.findAll.mockResolvedValue([])

    const results = await search(mockRequest, devUser, 'dog', '123451234512345 smith', true)
    expect(results.results.length).toBe(13)
    expect(results.totalFound).toBe(13)
  })

  test('search for microchip and other terms should not adjust threshold when fuzzy - test 2', async () => {
    sequelize.models.search_index.findAll.mockResolvedValue(moreThanTenResults)
    sequelize.models.search_match_code.findAll.mockResolvedValue([])
    sequelize.models.search_tgram.findAll.mockResolvedValue([])

    const results = await search(mockRequest, devUser, 'dog', '123451 smith', true)
    expect(results.results.length).toBe(13)
    expect(results.totalFound).toBe(13)
  })

  test('sorting should handle', async () => {
    const testList = JSON.parse(JSON.stringify(mockResultsForSorting))
    testList.sort(sortOwnerSearch)

    expect(testList[0].firstName).toBe('Peter')
    expect(testList[0].lastName).toBe('White')
    expect(testList[1].firstName).toBe('John')
    expect(testList[1].lastName).toBe('Smith')
    expect(testList[2].firstName).toBe('John')
    expect(testList[2].lastName).toBe('Smith')
  })
})
