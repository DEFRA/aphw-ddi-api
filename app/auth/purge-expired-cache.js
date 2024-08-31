/**
 * @param {Map<string, { expiry: Date, [string]: any }>} map
 * @return {Map<string, { expiry: Date, [string]: any }>}
 */
const purgeExpiredCache = (map) => {
  const updatedMap = new Map(map)
  const expiryTime = Date.now()

  for (const [key, value] of updatedMap) {
    if (value.expiry.getTime() < expiryTime) {
      updatedMap.delete(key)
    }
  }

  return updatedMap
}

module.exports = {
  purgeExpiredCache
}
