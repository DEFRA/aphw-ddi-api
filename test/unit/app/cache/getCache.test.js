const getCache = require('../../../../app/cache/get-cache')
const { requestWithCache } = require('../../../mocks/request')

describe('getCache', () => {
  test('should use cache from request', async () => {
    const cache = getCache(requestWithCache)
    expect(cache.key).toBe(1)
  })

  test('should use cache from request given get method not available', async () => {
    const request = {
      ...requestWithCache,
      set: jest.fn()
    }
    const cache = getCache(request)
    expect(cache.key).toBe(1)
  })

  test('should use cache from request given drop method not available', async () => {
    const request = {
      ...requestWithCache,
      set: jest.fn(),
      get: jest.fn()
    }
    const cache = getCache(request)
    expect(cache.key).toBe(1)
  })

  test('should use cache from cache object', async () => {
    const cacheObject = {
      get: () => {},
      set: () => {},
      drop: () => {},
      key: 1
    }
    const cache = getCache(cacheObject)
    expect(cache.key).toBe(1)
  })
})
