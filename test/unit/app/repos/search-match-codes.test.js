const { matchCodeSeeding, fuzzySearchResults } = require('../../../mocks/search-results')

describe('Search match codes repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      search_index: {
        findAll: jest.fn(),
        findOne: jest.fn()
      },
      search_match_code: {
        truncate: jest.fn(),
        create: jest.fn(),
        findAll: jest.fn()
      }
    },
    col: jest.fn(),
    fn: jest.fn(),
    where: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  const { populateMatchCodes, fuzzySearch } = require('../../../../app/repos/search-match-codes')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('populateMatchCodes', () => {
    test('should fill table with match codes', async () => {
      sequelize.models.search_index.findAll.mockResolvedValue(matchCodeSeeding)
      await populateMatchCodes()
      expect(sequelize.models.search_match_code.create).toHaveBeenCalledTimes(16)
      expect(sequelize.models.search_match_code.create.mock.calls[0]).toEqual([{ person_id: 11, match_code: '160000' }, { transaction: undefined }])
      expect(sequelize.models.search_match_code.create.mock.calls[1]).toEqual([{ person_id: 11, match_code: '460000' }, { transaction: undefined }])
      expect(sequelize.models.search_match_code.create.mock.calls[2]).toEqual([{ person_id: 11, match_code: 'JAN' }, { transaction: undefined }])
      expect(sequelize.models.search_match_code.create.mock.calls[3]).toEqual([{ person_id: 11, match_code: '463000' }, { transaction: undefined }])
      expect(sequelize.models.search_match_code.create.mock.calls[4]).toEqual([{ person_id: 11, match_code: 'SNATH' }, { transaction: undefined }])
      expect(sequelize.models.search_match_code.create.mock.calls[5]).toEqual([{ person_id: 11, match_code: '343653' }, { transaction: undefined }])
      expect(sequelize.models.search_match_code.create.mock.calls[6]).toEqual([{ person_id: 22, match_code: '739000' }, { transaction: undefined }])
      expect(sequelize.models.search_match_code.create.mock.calls[7]).toEqual([{ person_id: 22, match_code: 'PATAR' }, { transaction: undefined }])
      expect(sequelize.models.search_match_code.create.mock.calls[8]).toEqual([{ person_id: 22, match_code: '753000' }, { transaction: undefined }])
      expect(sequelize.models.search_match_code.create.mock.calls[9]).toEqual([{ person_id: 22, match_code: 'WAT' }, { transaction: undefined }])
      expect(sequelize.models.search_match_code.create.mock.calls[10]).toEqual([{ person_id: 22, match_code: '753760' }, { transaction: undefined }])
      expect(sequelize.models.search_match_code.create.mock.calls[11]).toEqual([{ person_id: 11, match_code: '160000' }, { transaction: undefined }])
      expect(sequelize.models.search_match_code.create.mock.calls[12]).toEqual([{ person_id: 11, match_code: '460000' }, { transaction: undefined }])
      expect(sequelize.models.search_match_code.create.mock.calls[13]).toEqual([{ person_id: 11, match_code: 'JAN' }, { transaction: undefined }])
      expect(sequelize.models.search_match_code.create.mock.calls[14]).toEqual([{ person_id: 11, match_code: '463000' }, { transaction: undefined }])
    })
  })

  describe('fuzzySearch', () => {
    test('should dedupe persons', async () => {
      sequelize.models.search_match_code.findAll.mockResolvedValue(fuzzySearchResults)
      const res = await fuzzySearch(['john mark'])
      expect(res.length).toBe(4)
      expect(res[0]).toBe(1)
      expect(res[1]).toBe(11)
      expect(res[2]).toBe(2)
      expect(res[3]).toBe(3)
    })
  })
})
