class InvalidDateError extends Error {
  constructor (message) {
    super(message)
    this.name = 'InvalidDateError'
  }
}

module.exports = {
  InvalidDateError
}
