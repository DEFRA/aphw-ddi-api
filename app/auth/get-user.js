const getCallingUser = (request) => {
  return {
    username: request?.headers?.['ddi-username'] ?? '',
    displayname: request?.headers?.['ddi-displayname'] ?? ''
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
