const crypto = require('crypto')
const { addMinutes } = require('../lib/date-helpers')
const { isAccountEnabled } = require('../repos/user-accounts')
const { getUserInfo } = require('../proxy/auth-server')
const { hashCache } = require('../session/hashCache')

const expiryPeriodInMins = 65

const returnVal = (isValid, username = null) => {
  return { isValid, credentials: { id: username, user: username } }
}

const checkTokenOnline = async (username, token) => {
  try {
    const payload = await getUserInfo(token)

    return payload && payload.email === username && payload.email_verified === true
  } catch (e) {
    return false
  }
}

const validate = async (_request, username, token) => {
  const now = new Date()

  if (!token || !username) {
    return returnVal(false)
  }

  const hash = crypto.createHash('md5').update(token).digest('hex')

  const cached = hashCache.get(username)
  if (cached) {
    if (cached.expiry > now && cached.hash === hash) {
      // Valid non-expired token
      console.info(`Got from cache - expiry in ${Math.trunc((cached.expiry - now) / 1000 / 60)} mins`)
      return returnVal(true, username)
    }
  }

  // Validate token contents and store in cache
  const validToken = await checkTokenOnline(username, token)
  if (validToken) {
    const enabled = await isAccountEnabled(username)
    if (enabled) {
      hashCache.set(username, { hash, expiry: addMinutes(now, expiryPeriodInMins) })
      return returnVal(true, username)
    }
  }

  return returnVal(false)
}

module.exports = {
  validate
}
