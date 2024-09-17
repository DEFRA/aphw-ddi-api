const userInfoAudit = async (request) => {
  const payload = request.auth?.artifacts?.decoded?.payload

  if (payload) {
    const { username, displayname } = payload
    console.info(`User Info: ${new Date()}.  Username: ${request.auth?.artifacts?.decoded?.payload?.username}.  Issuer: ${request.auth?.artifacts?.decoded?.payload?.iss}`)

    return {
      username, displayname
    }
  }
  return { username: null, displayname: null }
}

const userValidateAudit = async (request) => {
  const payload = request.auth?.artifacts?.decoded?.payload

  if (payload) {
    const { username, displayname } = payload
    console.info(`User Validation: ${new Date()}.  Username: ${payload?.username}.  Issuer: ${payload?.iss}`)

    return {
      username, displayname
    }
  }

  return { username: null, displayname: null }
}

const userLogoutAudit = async (request) => {
  const payload = request.auth?.artifacts?.decoded?.payload

  if (payload) {
    const { username, displayname } = payload
    console.info(`User Logout: ${new Date()}.  Username: ${payload?.username}.  Issuer: ${payload?.iss}`)

    return {
      username, displayname
    }
  }

  return { username: null, displayname: null }
}

module.exports = {
  userLogoutAudit,
  userInfoAudit,
  userValidateAudit
}
