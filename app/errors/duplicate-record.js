const Boom = require('@hapi/boom')
function DuplicateRecordError (message = 'Duplicate record found') {
  const boomError = Boom.conflict(message)
  boomError.name = 'DuplicateRecordError'
  boomError.stack = (new Error()).stack

  return boomError
}

module.exports = { DuplicateRecordError }
