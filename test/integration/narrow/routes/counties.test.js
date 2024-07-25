describe('Counties endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/counties')
  const { getCounties } = require('../../../../app/repos/counties')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /counties route returns 200', async () => {
    getCounties.mockResolvedValue([
      'County1', 'County2', 'County3'
    ])

    const options = {
      method: 'GET',
      url: '/counties'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
