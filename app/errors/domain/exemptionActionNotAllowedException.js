class ExemptionActionNotAllowedException extends Error {
  constructor (message) {
    super(message)
    this.name = 'ExemptionActionNotAllowedException'
  }
}

module.exports = {
  ExemptionActionNotAllowedException
}
