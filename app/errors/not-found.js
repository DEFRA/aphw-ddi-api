const Boom = require('@hapi/boom')
function NotFoundError (message = 'Not Found') {
  const boomError = Boom.notFound(message)
  boomError.name = 'NotFoundError'
  boomError.stack = (new Error()).stack

  return boomError
}

module.exports = { NotFoundError }
