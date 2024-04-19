const { Boom } = require('@hapi/boom')

class DuplicateResourceError extends Boom {
  constructor (message) {
    super(message, { statusCode: 409 })
    this.message = message
    this.name = 'DuplicateResourceError'
    Object.setPrototypeOf(this, DuplicateResourceError.prototype)
  }
}

DuplicateResourceError.prototype.name = 'DuplicateResourceError'

module.exports = {
  DuplicateResourceError
}
