const crypto = require('crypto')
const { addMinutes } = require('../lib/date-helpers')
const { isAccountEnabled } = require('../repos/user-accounts')
const { getUserInfo } = require('../proxy/auth-server')
const { scopes } = require('../constants/auth')
const { get, set } = require('../cache')
const { MINUTE } = require('../constants/time')
const { sendLoginToAudit } = require('../messaging/send-audit')

const expiryPeriodInMins = 65

const returnVal = (
  isValid,
  {
    username = null,
    displayname = null,
    scope = []
  } = {}) => {
  return {
    isValid,
    credentials: {
      id: username,
      user: username,
      displayname: displayname ?? username,
      scope
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

const validateApi = (_username, payload) => {
  return returnVal(true, payload)
}

const validateEnforcement = async (request, username, payload) => {
  const { token } = payload

  if (!token) {
    return returnVal(false)
  }

  // Police service should not be able to add internal scopes
  if (scopes.internal.some(allowedScope => payload.scope?.includes(allowedScope))) {
    return returnVal(false)
  }

  const now = new Date()
  const hash = crypto.createHash('sha512').update(token).digest('hex')

  const cached = await get(request, username)

  if (cached) {
    if (new Date(cached.expiry).getTime() > now.getTime() && cached.hash === hash) {
      // Valid non-expired token
      // console.info(`Got from cache - expiry in ${Math.trunc((cached.expiry - now) / 1000 / 60)} mins`)
      return returnVal(true, payload)
    }
  }

  // Validate token contents and store in cache
  const validToken = await checkTokenOnline(username, token)

  if (validToken) {
    const enabled = await isAccountEnabled(username)

    if (enabled) {
      await sendLoginToAudit({ username, displayname: username }, request.headers['enforcement-user-agent'])

      await set(request, username, { hash, expiry: addMinutes(now, expiryPeriodInMins) }, expiryPeriodInMins * MINUTE)
      return returnVal(true, payload)
    }
  }

  return returnVal(false)
}

const validate = async (artifacts, request, _h) => {
  const decoded = artifacts.decoded
  const payload = decoded.payload
  const username = payload.username

  if (!scopes.all.some(allowedScope => payload.scope?.includes(allowedScope))) {
    return returnVal(false)
  }

  if (!username) {
    return returnVal(false)
  }

  switch (payload.iss) {
    case 'aphw-ddi-portal': {
      return validatePortal(username, payload)
    }
    case 'aphw-ddi-enforcement': {
      return validateEnforcement(request, username, payload)
    }
    case 'aphw-ddi-api': {
      return validateApi(username, payload)
    }
  }

  return returnVal(false)
}

module.exports = {
  validate
}
