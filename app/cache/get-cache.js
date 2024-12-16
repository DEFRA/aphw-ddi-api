
const isCacheObject = requestOrCache =>
  requestOrCache.set instanceof Function &&
  requestOrCache.get instanceof Function &&
  requestOrCache.drop instanceof Function

const getCache = (requestOrCache) => {
  if (isCacheObject(requestOrCache)) {
    return requestOrCache
  }
  return requestOrCache.server.app.cache
}

module.exports = getCache
