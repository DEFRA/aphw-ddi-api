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
    console.log('~~~~~~ Chris Debug ~~~~~~ checking OIDC', '')
    const payload = await getUserInfo(token)
    console.log('~~~~~~ Chris Debug ~~~~~~ OIDC payload', 'Payload', payload)

    return payload && payload.email === username && payload.email_verified === true
  } catch (e) {
    console.log('~~~~~~ Chris Debug ~~~~~~ failed OIDC check', '')
    return false
  }
}

const validatePortal = (_username, payload) => {
  console.log('~~~~~~ Chris Debug ~~~~~~ validating portal request', '')
  return returnVal(true, payload)
}
const validateEnforcement = async (username, payload) => {
  console.log('~~~~~~ Chris Debug ~~~~~~ validating enforcement request', '')
  const { token } = payload

  console.log('~~~~~~ Chris Debug ~~~~~~ ', 'Token', token)
  if (!token) {
    return returnVal(false)
  }

  const now = new Date()
  const hash = crypto.createHash('sha512').update(token).digest('hex')

  console.log('~~~~~~ Chris Debug ~~~~~~ ', 'Hash', hash)
  const cached = hashCache.get(username)
  if (cached) {
    console.log('~~~~~~ Chris Debug ~~~~~~ using cached token for Enforcement', '')
    if (cached.expiry > now && cached.hash === hash) {
      // Valid non-expired token
      // console.info(`Got from cache - expiry in ${Math.trunc((cached.expiry - now) / 1000 / 60)} mins`)
      return returnVal(true, payload)
    }
  }

  // Validate token contents and store in cache
  const validToken = await checkTokenOnline(username, token)
  if (validToken) {
    console.log('~~~~~~ Chris Debug ~~~~~~ enforcement token valid', '')
    const enabled = await isAccountEnabled(username)
    console.log('~~~~~~ Chris Debug ~~~~~~ enforcement user is enabled', 'Enabled', enabled)
    if (enabled) {
      console.log('~~~~~~ Chris Debug ~~~~~~ enforcement setting hash', '')
      hashCache.set(username, { hash, expiry: addMinutes(now, expiryPeriodInMins) })
      return returnVal(true, payload)
    }
  }

  return returnVal(false)
}

const validate = async (artifacts, _request, _h) => {
  console.log('~~~~~~ Chris Debug ~~~~~~ validating JWT token', 'Artifacts', artifacts)
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
