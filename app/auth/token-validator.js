const crypto = require('crypto')
const { addMinutes } = require('../lib/date-helpers')
const { isAccountEnabled } = require('../repos/user-accounts')
const { getUserInfo } = require('../proxy/auth-server')
const { hashCache } = require('../session/hashCache')

const expiryPeriodInMins = 65

const returnVal = (
  isValid,
  {
    username = null,
    displayname = null,
    scopes = []
  } = {}) => {
  return {
    isValid,
    credentials: {
      id: username,
      user: username,
      displayname: displayname ?? username,
      scopes
    }
  }
}

const checkTokenOnline = async (username, token) => {
  try {
    const payload = await getUserInfo(token)

    return payload && payload.email === username && payload.email_verified === true
  } catch (e) {
    return false
  }
}

const validatePortal = (_username, payload) => {
  return returnVal(true, payload)
}
const validateEnforcement = async (username, payload) => {
  const { token } = payload

  if (!token) {
    returnVal(false)
  }

  const now = new Date()
  const hash = crypto.createHash('md5').update(token).digest('hex')

  const cached = hashCache.get(username)
  if (cached) {
    if (cached.expiry > now && cached.hash === hash) {
      // Valid non-expired token
      console.info(`Got from cache - expiry in ${Math.trunc((cached.expiry - now) / 1000 / 60)} mins`)
      return returnVal(true, payload)
    }
  }

  // Validate token contents and store in cache
  const validToken = await checkTokenOnline(username, token)
  if (validToken) {
    const enabled = await isAccountEnabled(username)
    if (enabled) {
      hashCache.set(username, { hash, expiry: addMinutes(now, expiryPeriodInMins) })
      return returnVal(true, payload)
    }
  }

  return returnVal(false)
}

const validate = async (artifacts, _request, _h) => {
  const decoded = artifacts.decoded
  const payload = decoded.payload
  const username = payload.username

  if (!username) {
    return returnVal(false)
  }

  switch (payload.iss) {
    case 'aphw-ddi-portal': {
      return validatePortal(username, payload)
    }
    case 'aphw-ddi-enforcement': {
      return validateEnforcement(username, payload)
    }
  }

  return returnVal(false)
}

module.exports = {
  validate
}
