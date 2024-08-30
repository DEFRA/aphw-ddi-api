const { authHeaders, mockValidate } = require('../../../mocks/auth')
describe('User endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')

  jest.mock('../../../../app/session/hashCache', () => ({
    hashCache: new Map()
  }))
  const { hashCache } = require('../../../../app/session/hashCache')

  beforeEach(async () => {
    jest.clearAllMocks()
    validate.mockResolvedValue(mockValidate)
    server = await createServer()
    await server.initialize()
  })

  test('DELETE /user/cache/my route returns 204', async () => {
    hashCache.set('dev-user@test.com', 'ABCDEFG12345')

    const options = {
      method: 'DELETE',
      url: '/user/cache/my',
      ...authHeaders
    }

    expect(hashCache.has('dev-user@test.com')).toBe(true)

    const response = await server.inject(options)
    expect(response.statusCode).toBe(204)
    expect(hashCache.has('dev-user@test.com')).toBe(false)
  })

  afterEach(async () => {
    await server.stop()
  })
})
