const { trigramSeeding, trigramSearchResults } = require('../../../mocks/search-results')

describe('Search tgrams repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      search_index: {
        findAll: jest.fn(),
        findOne: jest.fn()
      },
      search_tgram: {
        truncate: jest.fn(),
        create: jest.fn(),
        findAll: jest.fn(),
        destroy: jest.fn()
      }
    },
    col: jest.fn(),
    fn: jest.fn(),
    where: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  const { populateTrigrams, trigramSearch, updateTrigramsPerDogOrPerson } = require('../../../../app/repos/search-tgrams')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('populateTrigrams', () => {
    test('should fill table with trigrams', async () => {
      sequelize.models.search_index.findAll.mockResolvedValue(trigramSeeding)
      await populateTrigrams()
      expect(sequelize.models.search_tgram.create).toHaveBeenCalledTimes(7)
      expect(sequelize.models.search_tgram.create.mock.calls[0]).toEqual([{ dog_id: 1, person_id: null, match_text: '123456789011111' }])
      expect(sequelize.models.search_tgram.create.mock.calls[1]).toEqual([{ dog_id: 1, person_id: null, match_text: '345345345345345' }])
      expect(sequelize.models.search_tgram.create.mock.calls[2]).toEqual([{ dog_id: null, person_id: 11, match_text: 'ts11ts' }])
      expect(sequelize.models.search_tgram.create.mock.calls[3]).toEqual([{ dog_id: 2, person_id: null, match_text: '123456789022222' }])
      expect(sequelize.models.search_tgram.create.mock.calls[4]).toEqual([{ dog_id: null, person_id: 22, match_text: 'ts22ts' }])
      expect(sequelize.models.search_tgram.create.mock.calls[5]).toEqual([{ dog_id: 3, person_id: null, match_text: '123456789033333' }])
      expect(sequelize.models.search_tgram.create.mock.calls[6]).toEqual([{ dog_id: null, person_id: 11, match_text: 'ts11ts' }])
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

  describe('updateTrigramsPerDogOrPerson', () => {
    test('should handle updates for dog with 2 microchips', async () => {
      sequelize.models.search_tgram.findAll.mockResolvedValue(trigramSearchResults)

      const row = {
        json: {
          microchipNumber: '123451234512345',
          microchipNumber2: '123451234511111'
        },
        dog_id: 123
      }

      await updateTrigramsPerDogOrPerson(123, 'dog', row, {})

      expect(sequelize.models.search_tgram.destroy).toHaveBeenCalledWith({ where: { dog_id: 123 }, force: true }, { transaction: {} })
      expect(sequelize.models.search_tgram.create).toHaveBeenCalledTimes(2)
      expect(sequelize.models.search_tgram.create.mock.calls[0][0]).toEqual({ dog_id: 123, match_text: '123451234512345', person_id: null })
      expect(sequelize.models.search_tgram.create.mock.calls[1][0]).toEqual({ dog_id: 123, match_text: '123451234511111', person_id: null })
    })

    test('should handle updates for dog with zero microchips', async () => {
      sequelize.models.search_tgram.findAll.mockResolvedValue(trigramSearchResults)

      const row = {
        json: {
        },
        dog_id: 123
      }

      await updateTrigramsPerDogOrPerson(123, 'dog', row, {})

      expect(sequelize.models.search_tgram.destroy).toHaveBeenCalledWith({ where: { dog_id: 123 }, force: true }, { transaction: {} })
      expect(sequelize.models.search_tgram.create).toHaveBeenCalledTimes(0)
    })

    test('should handle updates for person with postcode', async () => {
      sequelize.models.search_tgram.findAll.mockResolvedValue(trigramSearchResults)

      const row = {
        json: {
          address: { postcode: 'TS1 1TS' }
        },
        person_id: 456
      }

      await updateTrigramsPerDogOrPerson(456, 'person', row, {})

      expect(sequelize.models.search_tgram.destroy).toHaveBeenCalledWith({ where: { person_id: 456 }, force: true }, { transaction: {} })
      expect(sequelize.models.search_tgram.create).toHaveBeenCalledTimes(1)
      expect(sequelize.models.search_tgram.create.mock.calls[0][0]).toEqual({ dog_id: null, match_text: 'ts11ts', person_id: 456 })
    })

    test('should handle updates for person with no postcode', async () => {
      sequelize.models.search_tgram.findAll.mockResolvedValue(trigramSearchResults)

      const row = {
        json: {
        },
        person_id: 456
      }

      await updateTrigramsPerDogOrPerson(456, 'person', row, {})

      expect(sequelize.models.search_tgram.destroy).toHaveBeenCalledWith({ where: { person_id: 456 }, force: true }, { transaction: {} })
      expect(sequelize.models.search_tgram.create).toHaveBeenCalledTimes(0)
    })
  })
})
