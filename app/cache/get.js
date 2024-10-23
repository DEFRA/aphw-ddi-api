const getCache = require('./get-cache')
const getCacheValue = require('./get-cache-value')

const get = async (request, key) => {
  try {
    return await getCacheValue(getCache(request), key)
  } catch {
    return undefined
  }
}

module.exports = get
