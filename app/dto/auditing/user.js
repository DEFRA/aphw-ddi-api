const { sendCreateToAudit, sendDeleteToAudit } = require('../../messaging/send-audit')
const { USER_ACCOUNT } = require('../../constants/event/audit-event-object-types')
const { getCallingUser } = require('../../auth/get-user')

const createUserAccountAudit = async (account, user) => {
  await sendCreateToAudit(USER_ACCOUNT, account, user)
}

const deleteUserAccountAudit = async (account, user) => {
  await sendDeleteToAudit(USER_ACCOUNT, account, user)
}

const userInfoAudit = async (request) => {
  const user = getCallingUser(request)

  if (user.username) {
    const { username, displayname } = user
    // console.info(`User Info: ${new Date()}.  Username: ${request.auth?.artifacts?.decoded?.payload?.username}.  Issuer: ${request.auth?.artifacts?.decoded?.payload?.iss}`)

    return {
      username, displayname
    }
  }
  return { username: null, displayname: null }
}

const userValidateAudit = async (request) => {
  const user = getCallingUser(request)

  if (user.username) {
    const { username, displayname } = user
    // console.info(`User Validation: ${new Date()}.  Username: ${payload?.username}.  Issuer: ${payload?.iss}`)

    return {
      username, displayname
    }
  }

  return { username: null, displayname: null }
}

const userLogoutAudit = async (request) => {
  const user = getCallingUser(request)

  if (user.username) {
    const { username, displayname } = user
    // console.info(`User Logout: ${new Date()}.  Username: ${payload?.username}.  Issuer: ${payload?.iss}`)

    return {
      username, displayname
    }
  }

  return { username: null, displayname: null }
}

module.exports = {
  createUserAccountAudit,
  deleteUserAccountAudit,
  userLogoutAudit,
  userInfoAudit,
  userValidateAudit
}
