const getCache = require('./get-cache')
const setCacheValue = require('./set-cache-value')

const set = async (request, key, value, ttl) => {
  await setCacheValue(getCache(request), key, value, ttl)
}

module.exports = set
