const config = require('../config')

const setCacheValue = async (cache, key, value, ttl) => {
  try {
    await cache.set(key, value, ttl || config.cacheConfig.ttl)
  } catch (e) {
    console.error('Cannot set cache')
    return undefined
  }
}

module.exports = setCacheValue
