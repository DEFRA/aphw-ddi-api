const wreck = require('@hapi/wreck')
const crypto = require('crypto')
const config = require('../config/index')
const { addMinutes } = require('../lib/date-helpers')
const { isAccountEnabled } = require('../repos/user-accounts')

const expiryPeriodInMins = 65

const hashCache = new Map()

const returnVal = (isValid, username = null) => {
  return { isValid, credentials: { id: username, user: username } }
}

const addBearerHeader = (token) => {
  return {
    Authorization: `Bearer ${token}`
  }
}
const checkTokenOnline = async (username, token) => {
  const options = { json: true, headers: addBearerHeader(token) }
  const endpoint = `https://${config.authServerHostname}/userinfo`
  console.log('token', token ? `${token.substr(0, 3)}...${token.substr(token.length - 3)}` : '')
  console.log('username', username)
  const { payload } = await wreck.get(endpoint, options)
  return payload && payload.email === username
}

const validate = async (request, username, token) => {
  console.log(' ')
  console.log('username', username)
  console.log('token', token ? `${token.substr(0, 3)}...${token.substr(token.length - 3)}` : '')
  const now = new Date()

  if (!token || !username) {
    return returnVal(false)
  }

  const hash = crypto.createHash('md5').update(token).digest('hex')
  console.log('hash', hash)

  const cached = hashCache.get(username)
  if (cached) {
    if (cached.expiry > now && cached.hash === hash) {
      // Valid non-expired token
      console.log(`Got from cache - expiry in ${Math.trunc((cached.expiry - now) / 1000 / 60)} mins`)
      return returnVal(true, username)
    }
  }

  // Validate token contents and store in cache
  const validToken = await checkTokenOnline(username, token)
  if (validToken) {
    const enabled = await isAccountEnabled(username)
    if (enabled) {
      hashCache.set(username, { hash, expiry: addMinutes(now, expiryPeriodInMins) })
      console.log('set in cache')
      return returnVal(true, username)
    }
  }

  return returnVal(false)
}

// TODO - clean up expired cache entries from time to time

module.exports = {
  validate
}
