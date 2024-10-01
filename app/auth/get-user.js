const getCallingUser = (request) => {
  const {
    user,
    displayname
  } = request?.auth?.credentials ?? {}

  return {
    username: user ?? '',
    displayname: displayname ?? ''
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
  getCallingUsername
}
