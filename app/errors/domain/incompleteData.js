class IncompleteDataError extends Error {
  constructor (message) {
    super(message)
    this.name = 'IncompleteDataError'
  }
}

module.exports = {
  IncompleteDataError
}
