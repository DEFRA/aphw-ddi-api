const { uniqueResults, matchCodeResults, trigramResults } = require('../../../mocks/search-results')
const { devUser } = require('../../../mocks/auth')

describe('Search repo (fuzzy)', () => {
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

  test('fuzzy search should dedupe results', async () => {
    sequelize.models.search_index.findAll.mockResolvedValue(uniqueResults)
    sequelize.models.search_match_code.findAll.mockResolvedValue(matchCodeResults)
    sequelize.models.search_tgram.findAll.mockResolvedValue(trigramResults)

    const results = await search(mockRequest, devUser, 'dog', 'john mark peter', true)
    expect(results.results.length).toBe(3)
    expect(results.totalFound).toBe(3)
    expect(results.results[0].firstName).toBe('John')
    expect(results.results[0].lastName).toBe('Smith')
    expect(results.results[0].personId).toBe(11)
    expect(results.results[1].firstName).toBe('Peter')
    expect(results.results[1].lastName).toBe('White')
    expect(results.results[1].personId).toBe(22)
    expect(results.results[2].firstName).toBe('Mark')
    expect(results.results[2].lastName).toBe('Brown')
    expect(results.results[2].personId).toBe(33)
  })
})
