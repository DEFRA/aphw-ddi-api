const dropCacheKey = require('../../../../app/cache/drop-cache-key')

const key = 'Key'

const cache = {
  drop: jest.fn()
}

afterEach(async () => {
  jest.resetAllMocks()
})

describe('drop cache', () => {
  test('should use cache drop', async () => {
    const result = await dropCacheKey(cache, key)
    expect(cache.drop).toHaveBeenCalledWith(key)
    expect(result).toBeUndefined()
  })

  test('should not throw when there is an error', async () => {
    cache.drop.mockRejectedValue(new Error('Redis retreival error'))

    const result = await dropCacheKey(cache, key)

    expect(result).toBeUndefined()
  })
})
