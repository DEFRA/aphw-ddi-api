jest.mock('../../../../app/cache')
const { set, get } = require('../../../../app/cache')

const { getEnvCode, buildSearchCacheKey, saveResultsToCacheAndGetPageOne, getPageFromCache } = require('../../../../app/search/search-processors/search-results-paginator')

const array1to30 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]

describe('Search results paginator', () => {
  beforeEach(function () {
    jest.clearAllMocks()
    set.mockResolvedValue()
  })

  describe('getEnvCode', () => {
    test('should return blank string if no config', () => {
      expect(getEnvCode(undefined)).toBe('')
      expect(getEnvCode(null)).toBe('')
      expect(getEnvCode({})).toBe('')
    })

    test('should return blank string if config has wrong number of segments', () => {
      expect(getEnvCode('aphw-ddi-api')).toBe('')
      expect(getEnvCode('aphw-ddi-api-test-abc')).toBe('')
      expect(getEnvCode('')).toBe('')
    })

    test('should return 4th element if config is correct', () => {
      expect(getEnvCode('aphw-ddi-api-dev')).toBe('dev')
      expect(getEnvCode('aphw-ddi-api-test')).toBe('test')
      expect(getEnvCode('aphw-ddi-api-pre')).toBe('pre')
      expect(getEnvCode('aphw-ddi-api-prd')).toBe('prd')
    })
  })

  describe('buildSearchCacheKey', () => {
    test('should return compound string with default values', () => {
      const user = { username: 'testuser@here.com' }
      const request = { params: { terms: 'term1,term2' } }
      const res = buildSearchCacheKey(user, request)
      expect(res).toEqual('localtest|testuser@here.com|term1,term2|false')
    })

    test('should return compound string with extra param values', () => {
      const user = { username: 'testuser@here.com' }
      const request = { params: { terms: 'term1,term2' }, query: { fuzzy: true, national: true } }
      const res = buildSearchCacheKey(user, request)
      expect(res).toEqual('localtest|testuser@here.com|term1,term2|true')
    })
  })

  describe('saveResultsToCacheAndGetPageOne', () => {
    test('should save', async () => {
      const user = { username: 'testuser@here.com' }
      const request = { params: { terms: 'term1,term2' } }
      const results = { totalFound: 30, results: array1to30 }
      const res = await saveResultsToCacheAndGetPageOne(user, request, results)
      const expiryInMins = 1000 * 60 * 65
      expect(set).toHaveBeenCalledWith(request, 'localtest|testuser@here.com|term1,term2|false', { results: { results: array1to30, totalFound: 30 }, expiry: expect.anything() }, expiryInMins)
      expect(res).toEqual({
        success: true,
        results: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        totalFound: 30,
        page: 1
      })
    })
  })

  describe('getPageFromCache', () => {
    test('should get first page', async () => {
      const now = new Date()
      const expiryTime = new Date()
      expiryTime.setTime(now.getTime() + (5 * 60 * 1000))
      get.mockResolvedValue({ results: { results: array1to30, totalFound: 30 }, expiry: expiryTime })
      const page1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
      const user = { username: 'testuser@here.com' }
      const request = { params: { terms: 'term1,term2' }, query: { page: '1' } }
      const res = await getPageFromCache(user, request)
      expect(res).toEqual({
        success: true,
        results: page1,
        totalFound: 30,
        page: 1
      })
    })
  })

  test('should get second page', async () => {
    const now = new Date()
    const expiryTime = new Date()
    expiryTime.setTime(now.getTime() + (5 * 60 * 1000))
    get.mockResolvedValue({ results: { results: array1to30, totalFound: 30 }, expiry: expiryTime })
    const page2 = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
    const user = { username: 'testuser@here.com' }
    const request = { params: { terms: 'term1,term2' }, query: { page: 2 } }
    const res = await getPageFromCache(user, request)
    expect(res).toEqual({
      success: true,
      results: page2,
      totalFound: 30,
      page: 2
    })
  })

  test('should handle page if not cached', async () => {
    get.mockResolvedValue()
    const user = { username: 'testuser@here.com' }
    const request = { params: { terms: 'term1,term2' }, query: { page: 'abc' } }
    const res = await getPageFromCache(user, request)
    expect(res).toEqual({
      success: false,
      results: [],
      totalFound: 0,
      page: 1
    })
  })

  test('should handle page if cache expired', async () => {
    const now = new Date()
    const expiryTime = new Date()
    expiryTime.setTime(now.getTime() - (5 * 60 * 1000))
    get.mockResolvedValue({ results: { results: array1to30, totalFound: 30 }, expiry: expiryTime })
    const user = { username: 'testuser@here.com' }
    const request = { params: { terms: 'term1,term2' }, query: { page: 1 } }
    const res = await getPageFromCache(user, request)
    expect(res).toEqual({
      success: false,
      results: [],
      totalFound: 0,
      page: 1
    })
  })
})
