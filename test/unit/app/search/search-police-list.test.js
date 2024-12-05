jest.mock('../../../../app/cache')
const { set, get } = require('../../../../app/cache')

const { buildCacheKey, saveListToCache, getListFromCache } = require('../../../../app/search/search-processors/search-police-list')

describe('Search police list', () => {
  beforeEach(function () {
    jest.clearAllMocks()
    set.mockResolvedValue()
  })

  describe('buildCacheKey', () => {
    test('should return compound string with default values', () => {
      const user = { username: 'testuser@here.com' }
      const res = buildCacheKey(user)
      expect(res).toEqual('localtest|testuser@here.com|police-id-list')
    })
  })

  describe('saveListToCache', () => {
    test('should save', async () => {
      const user = { username: 'testuser@here.com' }
      const request = { }
      const policeIds = [1, 2, 3, 4]
      const res = await saveListToCache(user, request, policeIds)
      const expiryInMins = 1000 * 60 * 65
      expect(set).toHaveBeenCalledWith(request, 'localtest|testuser@here.com|police-id-list', { policeIds: [1, 2, 3, 4], expiry: expect.anything() }, expiryInMins)
      expect(res).toEqual([1, 2, 3, 4])
    })
  })

  describe('getListFromCache', () => {
    test('should get list', async () => {
      const now = new Date()
      const expiryTime = new Date()
      expiryTime.setTime(now.getTime() + (5 * 60 * 1000))
      get.mockResolvedValue({ policeIds: [5, 6, 7], expiry: expiryTime })
      const user = { username: 'testuser@here.com' }
      const request = { }
      const res = await getListFromCache(user, request)
      expect(res).toEqual([5, 6, 7])
    })
  })

  test('should handle page if not cached', async () => {
    get.mockResolvedValue()
    const user = { username: 'testuser@here.com' }
    const request = { }
    const res = await getListFromCache(user, request)
    expect(res).toEqual(null)
  })

  test('should handle if cache expired', async () => {
    const now = new Date()
    const expiryTime = new Date()
    expiryTime.setTime(now.getTime() - (5 * 60 * 1000))
    get.mockResolvedValue({ policeIds: [7, 8, 9], expiry: expiryTime })
    const user = { username: 'testuser@here.com' }
    const request = { }
    const res = await getListFromCache(user, request)
    expect(res).toEqual(null)
  })
})
