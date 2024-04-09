const { NotFoundError } = require('../../../../app/errors/notFound')

describe('NotFoundError', () => {
  test('should throw an error', () => {
    const notFoundError = new NotFoundError()
    expect(notFoundError).toBeInstanceOf(Error)
  })
  test('should have a message', () => {
    const notFoundError = new NotFoundError('User not found')
    expect(notFoundError.message).toBe('User not found')
  })
})
