const { jobs: mockJobs } = require('../../../mocks/jobs')

describe('Regular jobs endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/regular-jobs')
  const { getRegularJobs } = require('../../../../app/repos/regular-jobs')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /regular-jobs route returns 200', async () => {
    getRegularJobs.mockResolvedValue(mockJobs)

    const options = {
      method: 'GET',
      url: '/regular-jobs'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /regular-jobs route returns 500 if db error', async () => {
    getRegularJobs.mockRejectedValue(new Error('Test error'))

    const options = {
      method: 'GET',
      url: '/regular-jobs'
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(500)
  })

  afterEach(async () => {
    await server.stop()
  })
})
