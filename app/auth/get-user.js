/**
 * @param request
 * @return {string|null}
 */
const getUserOrigin = (request) => {
  return request?.auth?.artifacts?.decoded?.payload?.iss ?? null
}

/**
 * @param request
 * @return {{ displayname: string, username: string }}
 */
const getCallingUser = (request) => {
  const {
    user,
    displayname
  } = request?.auth?.credentials ?? {}

  return {
    username: user ?? '',
    displayname: displayname ?? '',
    origin: getUserOrigin(request)
  }
}

const isUserValid = (user) => {
  return user?.username && user?.username !== '' && user?.displayname && user?.displayname !== ''
}

const getCallingUsername = (request) => {
  const user = getCallingUser(request)

  if (!isUserValid(user)) {
    return null
  }

  return user.username
}

module.exports = {
  getCallingUser,
  isUserValid,
  getCallingUsername,
  getUserOrigin
}
