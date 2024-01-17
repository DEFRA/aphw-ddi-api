const getCallingUser = (request) => {
  return request?.headers?.['ddi-username'] ?? 'unknown'
}

module.exports = {
  getCallingUser
}
