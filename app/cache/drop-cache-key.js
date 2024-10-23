const dropCacheKey = async (cache, key) => {
  try {
    return await cache.drop(key)
  } catch (err) {
    console.error('Cannot drop cache key')
    return undefined
  }
}

module.exports = dropCacheKey
