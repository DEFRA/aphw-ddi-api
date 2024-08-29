const config = require('../config')
const wreck = require('@hapi/wreck')
const endpoint = `${config.authServerHostname}/userinfo`

const addBearerHeader = (token) => {
  return {
    Authorization: `Bearer ${token}`
  }
}

const getUserInfo = async (token) => {
  const options = { json: true, headers: addBearerHeader(token) }
  const { payload } = await wreck.get(endpoint, options)

  return payload
}

module.exports = {
  getUserInfo
}
