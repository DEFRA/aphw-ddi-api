const getCache = require('./get-cache')
const setCacheValue = require('./set-cache-value')

const set = async (requestOrCacheObject, key, value, ttl) => {
  await setCacheValue(getCache(requestOrCacheObject), key, value, ttl)
}

module.exports = set
