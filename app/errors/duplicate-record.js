const { Boom } = require('@hapi/boom')
// function DuplicateResourceError (message = 'Duplicate record found') {
//   const boomError = Boom.conflict(message)
//   boomError.name = 'DuplicateRecordError'
//   boomError.stack = (new Error()).stack
//   // Object.setPrototypeOf(this, DuplicateResourceError.prototype)
//
//   return boomError
// }
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
