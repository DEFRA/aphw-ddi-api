const userInfoAudit = async (request) => {
  if (request.auth?.artifacts?.decoded?.payload) {
    const { username, displayname } = request.auth?.artifacts?.decoded?.payload
    console.info(`User Info: ${new Date()}.  Username: ${request.auth?.artifacts?.decoded?.payload?.username}.  Issuer: ${request.auth?.artifacts?.decoded?.payload?.iss}`)

    return {
      username, displayname
    }
  }
  return { username: null, displayname: null }
}

const userValidateAudit = async (request) => {
  if (request.auth?.artifacts?.decoded?.payload) {
    const { username, displayname } = request.auth?.artifacts?.decoded?.payload
    console.info(`User Validation: ${new Date()}.  Username: ${request.auth?.artifacts?.decoded?.payload?.username}.  Issuer: ${request.auth?.artifacts?.decoded?.payload?.iss}`)

    return {
      username, displayname
    }
  }

  return { username: null, displayname: null }
}

const userLogoutAudit = async (request) => {
  if (request.auth?.artifacts?.decoded?.payload) {
    const { username, displayname } = request.auth?.artifacts?.decoded?.payload
    console.info(`User Logout: ${new Date()}.  Username: ${request.auth?.artifacts?.decoded?.payload?.username}.  Issuer: ${request.auth?.artifacts?.decoded?.payload?.iss}`)

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
