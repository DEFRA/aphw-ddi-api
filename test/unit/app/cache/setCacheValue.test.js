describe('setCacheValue', () => {
  const cache = { set: jest.fn() }
  const setCacheValue = require('../../../../app/cache/set-cache-value')

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('should set cache', async () => {
    await setCacheValue(cache, 'test', true)
    expect(cache.set).toHaveBeenCalledWith('test', true, expect.any(Number))
  })

  test('should fail gracefully', async () => {
    cache.set.mockRejectedValue(new Error('Failed to set cache'))
    const result = await setCacheValue(cache, 'test', true)
    expect(result).toBeUndefined()
  })
})
