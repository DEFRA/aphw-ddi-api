describe('Overnight endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/regular-jobs')
  const { updateOvernightStatuses } = require('../../../../app/repos/regular-jobs')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /overnight route returns 200 and calls updateOvernightStatuses', async () => {
    const options = {
      method: 'GET',
      url: '/overnight'
    }

    updateOvernightStatuses.mockResolvedValue({ result: 'ok' })

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
    expect(updateOvernightStatuses).toHaveBeenCalled()
  })

  afterEach(async () => {
    await server.stop()
  })
})
