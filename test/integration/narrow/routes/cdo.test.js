const mockCreatePayload = require('../../../mocks/cdo/create')

describe('CDO endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/cdo')
  const { createCdo } = require('../../../../app/repos/cdo')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('POST /cdo route returns 200 with valid payload', async () => {
    const options = {
      method: 'POST',
      url: '/cdo',
      payload: mockCreatePayload
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('POST /cdo route returns 400 with invalid payload', async () => {
    const options = {
      method: 'POST',
      url: '/cdo',
      payload: {}
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(400)
  })

  test('POST /cdo route returns 500 if db error', async () => {
    createCdo.mockRejectedValue(new Error('Test error'))

    const options = {
      method: 'POST',
      url: '/cdo',
      payload: mockCreatePayload
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(500)
  })

  afterEach(async () => {
    await server.stop()
  })
})
