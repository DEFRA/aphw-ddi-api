const { eventsTopic } = require('../../config/message')
const { getEnvCode } = require('../../lib/environment-helpers')
const { MINUTE } = require('../../constants/time')
const { addMinutes } = require('../../lib/date-helpers')
const { get, set } = require('../../cache')

const expiryPeriodInMins = 65

const buildCacheKey = (user) => {
  const env = getEnvCode(eventsTopic?.address)
  return `${env}|${user?.username}|police-id-list`
}

const getListFromCache = async (user, request) => {
  const cacheKey = buildCacheKey(user)
  const cached = await get(request, cacheKey)

  const now = new Date()

  if (cached?.policeIds) {
    if (new Date(cached.expiry).getTime() > now.getTime()) {
      // Valid result
      return cached.policeIds
    }
  }

  return null
}

const saveListToCache = async (user, request, policeIds) => {
  const cacheKey = buildCacheKey(user)
  const now = new Date()
  await set(request, cacheKey, { policeIds, expiry: addMinutes(now, expiryPeriodInMins) }, expiryPeriodInMins * MINUTE)
  return policeIds
}

module.exports = {
  buildCacheKey,
  getListFromCache,
  saveListToCache
}
