const { devUser } = require('../../../mocks/auth')

jest.mock('../../../../app/repos/police-force-helper')
const { getUsersForceList } = require('../../../../app/repos/police-force-helper')

describe('Search test', () => {
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
      }
    },
    fn: jest.fn(),
    col: jest.fn(),
    where: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')
  const { Op } = require('sequelize')

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

  describe('search', () => {
    beforeEach(async () => {
      jest.clearAllMocks()
    })

    test('should handle no terms', async () => {
      const terms = undefined
      const res = await search(mockRequest, devUser, 'dog', terms)
      expect(res).toEqual({ results: [], totalFound: 0 })
    })

    test('should handle national search', async () => {
      const terms = 'dummy'
      sequelize.models.search_index.findAll.mockResolvedValue([])
      const res = await search(mockRequest, devUser, 'dog', terms, false, true)
      expect(res).toEqual({ results: [], totalFound: 0 })
      expect(sequelize.models.search_index.findAll).toHaveBeenCalledTimes(1)
      expect(sequelize.models.search_index.findAll).toHaveBeenCalledWith({
        raw: true,
        where: { search: {} }
      })
    })

    test('should handle local search', async () => {
      const terms = 'dummy'
      sequelize.models.search_index.findAll.mockResolvedValue([])
      getUsersForceList.mockResolvedValue([1])
      const res = await search(mockRequest, devUser, 'dog', terms, false, false)
      expect(res).toEqual({ results: [], totalFound: 0 })
      expect(sequelize.models.search_index.findAll).toHaveBeenCalledTimes(1)
      expect(sequelize.models.search_index.findAll).toHaveBeenCalledWith({
        raw: true,
        where: { search: {}, police_force_id: [1] }
      })
    })

    test('should handle local fuzzy search', async () => {
      const terms = 'dummy'
      sequelize.models.search_index.findAll.mockResolvedValue([])
      sequelize.models.search_match_code.findAll.mockResolvedValue([])
      sequelize.models.search_tgram.findAll.mockResolvedValue([])
      getUsersForceList.mockResolvedValue([1, 2, 3])
      const res = await search(mockRequest, devUser, 'dog', terms, true, false)
      expect(res).toEqual({ results: [], totalFound: 0 })
      expect(sequelize.models.search_index.findAll).toHaveBeenCalledTimes(3)
      expect(sequelize.models.search_index.findAll).toHaveBeenNthCalledWith(1, {
        raw: true,
        where: { search: {}, police_force_id: [1, 2, 3] }
      })
      expect(sequelize.models.search_index.findAll).toHaveBeenNthCalledWith(2, {
        raw: true,
        where: { person_id: [], police_force_id: [1, 2, 3] }
      })
      expect(sequelize.models.search_index.findAll).toHaveBeenNthCalledWith(3, {
        raw: true,
        where: { [Op.or]: [{ person_id: [] }, { dog_id: [] }], police_force_id: [1, 2, 3] }
      })
    })
  })
})
