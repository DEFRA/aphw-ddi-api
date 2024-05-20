const { Boom } = require('@hapi/boom')

class DuplicateResourceError extends Boom {
  constructor (message, data = {}) {
    super(message, { statusCode: 409 })
    this.message = message
    this.name = 'DuplicateResourceError'
    this.output.payload = {
      ...this.output.payload,
      ...data
    }
    Object.setPrototypeOf(this, DuplicateResourceError.prototype)
  }
}

DuplicateResourceError.prototype.name = 'DuplicateResourceError'

module.exports = {
  DuplicateResourceError
}
