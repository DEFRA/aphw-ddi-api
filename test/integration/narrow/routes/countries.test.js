describe('Countries endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/countries')
  const { getCountries } = require('../../../../app/repos/countries')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /countries route returns 200', async () => {
    getCountries.mockResolvedValue([
      'Country1', 'Country2', 'Country3'
    ])

    const options = {
      method: 'GET',
      url: '/countries'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
