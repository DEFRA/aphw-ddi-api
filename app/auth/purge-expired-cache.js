const { hashCache } = require('../session/hashCache')

/**
 * @param {Map<string, { expiry: Date, [string]: any }>} map
 * @return string
 */
const purgeExpiredCache = () => {
  const expiryTime = Date.now()
  let count = 0

  for (const [key, value] of hashCache) {
    if (value.expiry.getTime() < expiryTime) {
      hashCache.delete(key)
      count++
    }
  }

  return `${count} users cleared from cache.\n`
}

module.exports = {
  purgeExpiredCache
}
