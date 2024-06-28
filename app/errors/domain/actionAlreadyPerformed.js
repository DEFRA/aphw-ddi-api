class ActionAlreadyPerformedError extends Error {
  constructor (message) {
    super(message)
    this.name = 'ActionAlreadyPerformedError'
  }
}

module.exports = {
  ActionAlreadyPerformedError
}
