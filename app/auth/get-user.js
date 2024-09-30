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

module.exports = {
  getCallingUser,
  isUserValid
}
