const userInfoAudit = async (request) => {
  const { username, displayname } = request.auth?.artifacts?.decoded?.payload
  console.info(`User Info: ${new Date()}.  Username: ${request.auth?.artifacts?.decoded?.payload?.username}.  Issuer: ${request.auth?.artifacts?.decoded?.payload?.iss}`)

  return {
    username, displayname
  }
}

const userValidateAudit = async (request) => {
  const { username, displayname } = request.auth?.artifacts?.decoded?.payload
  console.info(`User Validation: ${new Date()}.  Username: ${request.auth?.artifacts?.decoded?.payload?.username}.  Issuer: ${request.auth?.artifacts?.decoded?.payload?.iss}`)

  return {
    username, displayname
  }
}

const userLogoutAudit = async (request) => {
  const { username, displayname } = request.auth?.artifacts?.decoded?.payload
  console.info(`User Logout: ${new Date()}.  Username: ${request.auth?.artifacts?.decoded?.payload?.username}.  Issuer: ${request.auth?.artifacts?.decoded?.payload?.iss}`)

  return {
    username, displayname
  }
}

module.exports = {
  userLogoutAudit,
  userInfoAudit,
  userValidateAudit
}
