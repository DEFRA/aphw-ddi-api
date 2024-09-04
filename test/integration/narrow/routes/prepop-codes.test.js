describe('Prepop codes endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/search-match-codes')
  const { populateMatchCodes } = require('../../../../app/repos/search-match-codes')

  jest.mock('../../../../app/repos/search-tgrams')
  const { populateTrigrams } = require('../../../../app/repos/search-tgrams')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /prepop-codes returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/prepop-codes'
    }

    populateMatchCodes.mockResolvedValue()
    populateTrigrams.mockResolvedValue()

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
