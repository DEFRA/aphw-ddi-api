
describe('purge-expired-cache', () => {
  describe('purgeExpiredCache', () => {
    jest.mock('../../../../app/session/hashCache', () => {
      return { hashCache: new Map() }
    })
    const { hashCache } = require('../../../../app/session/hashCache')
    const { purgeExpiredCache } = require('../../../../app/auth/purge-expired-cache')

    test('should purge expired cache', () => {
      hashCache.set('cachedItem', { hash: 'abcde', expiry: new Date(Date.now() - 1) })

      const result = purgeExpiredCache(hashCache)

      expect([...hashCache.values()].length).toBe(0)
      expect(result).toBe('1 users cleared from cache.\n')
    })

    test('should not purge non-expired cache', () => {
      hashCache.set('cachedItem', { hash: 'abcde', expiry: new Date(Date.now() + 1000) })

      const result = purgeExpiredCache(hashCache)

      expect([...hashCache.values()].length).toBe(1)
      expect(result).toBe('0 users cleared from cache.\n')
    })
  })
})
