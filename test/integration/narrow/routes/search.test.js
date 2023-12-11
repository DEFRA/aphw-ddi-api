describe('SearchBasic endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/register/search-basic')
  const { search } = require('../../../../app/register/search-basic')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /search route returns 200', async () => {
    search.mockResolvedValue([])

    const options = {
      method: 'GET',
      url: '/search/dog/term'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /search route returns error', async () => {
    search.mockImplementation(() => { throw new Error('dummy error') })

    const options = {
      method: 'GET',
      url: '/search/dog/term'
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(500)
  })

  afterEach(async () => {
    await server.stop()
  })
})
