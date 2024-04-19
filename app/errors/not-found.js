const { Boom } = require('@hapi/boom')

class NotFoundError extends Boom {
  constructor (message) {
    super(message, { statusCode: 404 })
    this.message = message
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

module.exports = { NotFoundError }
