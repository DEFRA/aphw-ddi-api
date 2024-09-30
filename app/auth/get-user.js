const getCallingUser = (request) => {
  const {
    user,
    displayname
  } = request?.auth?.credentials ?? {}

  return {
    username: user ?? request?.headers?.['ddi-username'] ?? '',
    displayname: displayname ?? request?.headers?.['ddi-displayname'] ?? ''
  }
}

const isUserValid = (user) => {
  return user?.username && user?.username !== '' && user?.displayname && user?.displayname !== ''
}

module.exports = {
  getCallingUser,
  isUserValid
}
