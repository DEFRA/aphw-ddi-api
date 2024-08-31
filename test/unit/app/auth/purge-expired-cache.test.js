const { purgeExpiredCache } = require('../../../../app/auth/purge-expired-cache')
describe('purge-expired-cache', () => {
  describe('purgeExpiredCache', () => {
    test('should purge expired cache', () => {
      const map = new Map()
      map.set('cachedItem', { hash: 'abcde', expiry: new Date(Date.now() - 1) })

      const updatedMap = purgeExpiredCache(map)

      expect([...updatedMap.values()].length).toBe(0)
    })

    test('should not purge non-expired cache', () => {
      const map = new Map()
      map.set('cachedItem', { hash: 'abcde', expiry: new Date(Date.now() + 1000) })

      const updatedMap = purgeExpiredCache(map)

      expect([...updatedMap.values()].length).toBe(1)
    })
  })
})
