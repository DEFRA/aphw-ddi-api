class SequenceViolationError extends Error {
  constructor (message) {
    super(message)
    this.name = 'SequenceViolationError'
  }
}

module.exports = {
  SequenceViolationError
}
