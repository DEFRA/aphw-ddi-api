const wreck = require('@hapi/wreck')
const crypto = require('crypto')
const config = require('../config/index')
const { addMinutes } = require('../lib/date-helpers')

const hashCache = new Map()

const returnVal = (isValid, username = null) => {
  return { isValid, credentials: { id: username, user: username } }
}

const checkTokenOnline = async (token) => {
  const { payload } = await wreck.get(`https://${config.authServerHostname}/userinfo`, options)
  return payload
}

const validate = async (request, username, token) => {
  console.log('username', username)
  console.log('token', token ? `${token.substr(0, 2)}...${token.substr(token.length - 2)}` : '')
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
      console.log('Got from cache')
      return returnVal(true, username)
    }
  }

  // Validate token contents and store in cache
  // validate with OneLogin
  const validToken = true
  if (validToken) {
    hashCache.set(username, { hash, expiry: addMinutes(now, 60) })
    console.log('set in cache')
    return returnVal(true, username)
  }

  return returnVal(false)
}

// TODO - clean up expired cache entries from time to time
// Make internet call to OneLogin to validate token

module.exports = {
  validate
}
