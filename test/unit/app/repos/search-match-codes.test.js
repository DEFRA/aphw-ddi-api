const { matchCodeSeeding, trigramSeeding, fuzzySearchResults, trigramSearchResults } = require('../../../mocks/search-results')

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
      },
      search_tgram: {
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

  const { populateMatchCodes, populateTrigrams, fuzzySearch, trigramSearch, rankResult } = require('../../../../app/repos/search-match-codes')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('populateMatchCodes', () => {
    test('should fill table with match codes', async () => {
      sequelize.models.search_index.findAll.mockResolvedValue(matchCodeSeeding)
      await populateMatchCodes()
      expect(sequelize.models.search_match_code.create).toHaveBeenCalledTimes(8)
      expect(sequelize.models.search_match_code.create.mock.calls[0]).toEqual([{ person_id: 11, match_code: '160000' }])
      expect(sequelize.models.search_match_code.create.mock.calls[1]).toEqual([{ person_id: 11, match_code: '460000' }])
      expect(sequelize.models.search_match_code.create.mock.calls[2]).toEqual([{ person_id: 11, match_code: '463000' }])
      expect(sequelize.models.search_match_code.create.mock.calls[3]).toEqual([{ person_id: 22, match_code: '739000' }])
      expect(sequelize.models.search_match_code.create.mock.calls[4]).toEqual([{ person_id: 22, match_code: '753000' }])
      expect(sequelize.models.search_match_code.create.mock.calls[5]).toEqual([{ person_id: 11, match_code: '160000' }])
      expect(sequelize.models.search_match_code.create.mock.calls[6]).toEqual([{ person_id: 11, match_code: '460000' }])
      expect(sequelize.models.search_match_code.create.mock.calls[7]).toEqual([{ person_id: 11, match_code: '463000' }])
    })
  })

  describe('populateTrigrams', () => {
    test('should fill table with trigrams', async () => {
      sequelize.models.search_index.findAll.mockResolvedValue(trigramSeeding)
      await populateTrigrams()
      expect(sequelize.models.search_tgram.create).toHaveBeenCalledTimes(7)
      expect(sequelize.models.search_tgram.create.mock.calls[0]).toEqual([{ dog_id: 1, match_text: '123456789011111' }])
      expect(sequelize.models.search_tgram.create.mock.calls[1]).toEqual([{ dog_id: 1, match_text: '345345345345345' }])
      expect(sequelize.models.search_tgram.create.mock.calls[2]).toEqual([{ person_id: 11, match_text: 'ts11ts' }])
      expect(sequelize.models.search_tgram.create.mock.calls[3]).toEqual([{ dog_id: 2, match_text: '123456789022222' }])
      expect(sequelize.models.search_tgram.create.mock.calls[4]).toEqual([{ person_id: 22, match_text: 'ts22ts' }])
      expect(sequelize.models.search_tgram.create.mock.calls[5]).toEqual([{ dog_id: 3, match_text: '123456789033333' }])
      expect(sequelize.models.search_tgram.create.mock.calls[6]).toEqual([{ person_id: 11, match_text: 'ts11ts' }])
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

  describe('trigramSearch', () => {
    test('should dedupe persons and dogs', async () => {
      sequelize.models.search_tgram.findAll.mockResolvedValue(trigramSearchResults)
      const { uniquePersons, uniqueDogs } = await trigramSearch(['john mark'], 0.5)
      expect(uniquePersons.length).toBe(3)
      expect(uniqueDogs.length).toBe(2)
      expect(uniquePersons[0]).toBe(7)
      expect(uniquePersons[1]).toBe(3)
      expect(uniquePersons[2]).toBe(6)
      expect(uniqueDogs[0]).toBe(2)
      expect(uniqueDogs[1]).toBe(3)
    })
  })

  describe('rankResult', () => {
    test('should return 0 if nothing matches', () => {
      const row = {
        id: 124,
        dog_id: 2,
        person_id: 22,
        json: {
          firstName: 'Peter',
          lastName: 'White',
          dogName: 'Butch',
          address: {
            address_line_1: '2 test address',
            postcode: 'TS2 2TS'
          },
          microchipNumber: 123456789022222
        }
      }
      const rank = rankResult(['john mark'], row, 'owner')
      expect(rank).toBe(0)
    })

    test('should return 2 for exact dogName match on owner search', () => {
      const row = {
        id: 124,
        dog_id: 2,
        person_id: 22,
        json: {
          firstName: 'Peter',
          lastName: 'White',
          dogName: 'Butch',
          address: {
            address_line_1: '2 test address',
            postcode: 'TS2 2TS'
          },
          microchipNumber: 123456789022222
        }
      }
      const rank = rankResult(['butch'], row, 'owner')
      expect(rank).toBe(2)
    })

    test('should return 4 for exact dogName match on dog search', () => {
      const row = {
        id: 124,
        dog_id: 2,
        person_id: 22,
        json: {
          firstName: 'Peter',
          lastName: 'White',
          dogName: 'Butch',
          address: {
            address_line_1: '2 test address',
            postcode: 'TS2 2TS'
          },
          microchipNumber: 123456789022222
        }
      }
      const rank = rankResult(['butch'], row, 'dog')
      expect(rank).toBe(4)
    })

    test('should return 2 for joined postcode match', () => {
      const row = {
        id: 124,
        dog_id: 2,
        person_id: 22,
        json: {
          firstName: 'Peter',
          lastName: 'White',
          dogName: 'Butch',
          address: {
            address_line_1: '2 test address',
            postcode: 'TS2 2TS'
          },
          microchipNumber: 123456789022222
        }
      }
      const rank = rankResult(['ts22ts'], row, 'dog')
      expect(rank).toBe(2)
    })

    test('should return 2 for exact postcode match where terms postcode is separated by a space', () => {
      const row = {
        id: 124,
        dog_id: 2,
        person_id: 22,
        json: {
          firstName: 'Peter',
          lastName: 'White',
          dogName: 'Butch',
          address: {
            address_line_1: '2 test address',
            postcode: 'TS2 2TS'
          },
          microchipNumber: 123456789022222
        }
      }
      const rank = rankResult(['ts22ts', 'ts2', '2ts'], row, 'dog')
      expect(rank).toBe(2)
    })

    test('should return 1.25 for joined postcode PARTIAL match', () => {
      const row = {
        id: 124,
        dog_id: 2,
        person_id: 22,
        json: {
          firstName: 'Peter',
          lastName: 'White',
          dogName: 'Butch',
          address: {
            address_line_1: '2 test address',
            postcode: 'TS2 2TS'
          },
          microchipNumber: 123456789022222
        }
      }
      const rank = rankResult(['ts22tt'], row, 'dog')
      expect(rank).toBe(1.25)
    })

    test('should return 1.25 for PARTIAL postcode match where terms postcode is separated by a space', () => {
      const row = {
        id: 124,
        dog_id: 2,
        person_id: 22,
        json: {
          firstName: 'Peter',
          lastName: 'White',
          dogName: 'Butch',
          address: {
            address_line_1: '2 test address',
            postcode: 'TS3 2TS'
          },
          microchipNumber: 123456789022222
        }
      }
      const rank = rankResult(['ts22ts', 'ts2', '2ts'], row, 'dog')
      expect(rank).toBe(1.25)
    })
  })
})
