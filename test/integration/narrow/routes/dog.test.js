describe('Dog endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/dogs')
  const { getDogByIndexNumber, addImportedDog } = require('../../../../app/repos/dogs')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /dog/ED123 route returns 200', async () => {
    getDogByIndexNumber.mockResolvedValue({ id: 123, indexNumber: 'ED123' })

    const options = {
      method: 'GET',
      url: '/dog/ED123'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /dog/ED123 route returns 500 if db error', async () => {
    getDogByIndexNumber.mockRejectedValue(new Error('Test error'))

    const options = {
      method: 'GET',
      url: '/dog/ED123'
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(500)
  })

  test('POST /dog route returns 400 with invalid payload', async () => {
    addImportedDog.mockResolvedValue()

    const options = {
      method: 'POST',
      url: '/dog',
      payload: {}
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(400)
  })

  test('POST /dog route returns 200 with valid payload', async () => {
    addImportedDog.mockResolvedValue()

    const options = {
      method: 'POST',
      url: '/dog',
      payload: { dog: { name: 'Bruno' } }
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
