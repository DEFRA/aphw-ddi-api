const { mockValidate, authHeaders } = require('../../../mocks/auth')

describe('Counties endpoint', () => {
  // jest.mock('../../../../app/auth/token-validator')
  // const { validate } = require('../../../../app/auth/token-validator')
  // validate.mockResolvedValue({ isValid: true, credentials: { id: 'Dev User', user: 'dev-user@test.com' } })

  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/counties')
  const { getCounties } = require('../../../../app/repos/counties')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')
  validate.mockResolvedValue(mockValidate)

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /counties route returns 200', async () => {
    getCounties.mockResolvedValue([
      { id: 1, county: 'County1' },
      { id: 2, county: 'County2' },
      { id: 3, county: 'County3' }
    ])

    const options = {
      method: 'GET',
      url: '/counties',
      ...authHeaders
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
