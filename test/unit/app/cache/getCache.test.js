const getCache = require('../../../../app/cache/get-cache')
const { requestWithCache } = require('../../../mocks/request')

describe('getCache', () => {
  test('should use cache from request', async () => {
    const cache = getCache(requestWithCache)
    expect(cache.key).toBe(1)
  })
})
