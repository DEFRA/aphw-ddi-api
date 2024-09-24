const { verifyLicenceAccepted, setLicenceAcceptedDate } = require('../repos/user-accounts')

const userVerifyLicenceAccepted = async (request) => {
  const payload = request.auth?.artifacts?.decoded?.payload
  if (payload) {
    const { username } = payload
    return await verifyLicenceAccepted(username)
  }
  return false
}

const userSetLicenceAccepted = async (request) => {
  const payload = request.auth?.artifacts?.decoded?.payload
  if (payload) {
    const { username } = payload
    return await setLicenceAcceptedDate(username)
  }

  return false
}

module.exports = {
  userVerifyLicenceAccepted,
  userSetLicenceAccepted
}
