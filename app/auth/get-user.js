const getCallingUser = (request) => {
  return request?.headers?.['ddi-username'] ?? ''
}

module.exports = {
  getCallingUser
}
