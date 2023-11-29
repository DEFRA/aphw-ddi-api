describe('Courts endpoint', () => {
  const { courts: mockCourts } = require('../../../mocks/courts')

  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/courts')
  const { getCourts } = require('../../../../app/repos/courts')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /courts route returns 200', async () => {
    getCourts.mockResolvedValue(mockCourts)

    const options = {
      method: 'GET',
      url: '/courts'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /courts route returns courts', async () => {
    getCourts.mockResolvedValue(mockCourts)

    const options = {
      method: 'GET',
      url: '/courts'
    }

    const response = await server.inject(options)
    const { courts } = JSON.parse(response.payload)

    expect(courts).toHaveLength(3)
    expect(courts).toContainEqual({ id: 1, name: 'Horsham Law Courts' })
    expect(courts).toContainEqual({ id: 2, name: 'Maidstone Magistrates\' Courts' })
    expect(courts).toContainEqual({ id: 3, name: 'North Somerset Courthouse' })
  })

  test('GET /courts route returns 500 if db error', async () => {
    getCourts.mockRejectedValue(new Error('Test error'))

    const options = {
      method: 'GET',
      url: '/courts'
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(500)
  })

  afterEach(async () => {
    await server.stop()
  })
})
