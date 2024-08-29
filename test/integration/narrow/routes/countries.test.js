const { authHeaders, mockValidate } = require('../../../mocks/auth')
describe('Countries endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/countries')
  const { getCountries } = require('../../../../app/repos/countries')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')
  validate.mockResolvedValue(mockValidate)

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /countries route returns 200', async () => {
    getCountries.mockResolvedValue([
      { id: 1, country: 'Country1' },
      { id: 2, country: 'Country2' },
      { id: 3, country: 'Country3' }
    ])

    const options = {
      method: 'GET',
      url: '/countries',
      ...authHeaders
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
