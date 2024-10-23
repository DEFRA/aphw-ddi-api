const config = require('../config')

const setCacheValue = async (cache, key, value) => {
  try {
    await cache.set(key, value, config.cacheConfig.ttl)
  } catch (e) {
    console.error('Cannot set cache')
    return undefined
  }
}

module.exports = setCacheValue
