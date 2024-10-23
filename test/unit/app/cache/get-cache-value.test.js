const getCacheValue = require('../../../../app/cache/get-cache-value')

const key = 'Key'

const cache = {
  get: jest.fn()
}

afterEach(async () => {
  jest.resetAllMocks()
})

describe('drop cache', () => {
  test('should use cache drop', async () => {
    const result = await getCacheValue(cache, key)
    expect(cache.get).toHaveBeenCalledWith(key)
    expect(result).toBeUndefined()
  })

  test('should not throw when there is an error', async () => {
    cache.get.mockRejectedValue(new Error('Redis retreival error'))

    const wrapper = async () => {
      await getCacheValue(cache, key)
    }

    await expect(wrapper).rejects.toThrowError(new Error('No cache value for key'))
  })
})
