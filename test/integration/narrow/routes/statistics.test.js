const { countsPerStatus: mockCountsPerStatus } = require('../../../mocks/statistics')

describe('Statistics endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/statistics')
  const { getCountsPerStatus } = require('../../../../app/repos/statistics')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  describe('GET /statistics?queryName=countsPerStatus', () => {
    test('route returns 200', async () => {
      getCountsPerStatus.mockResolvedValue(mockCountsPerStatus)

      const options = {
        method: 'GET',
        url: '/statistics?queryName=countsPerStatus'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('route returns 400 if invalid param key name', async () => {
      getCountsPerStatus.mockResolvedValue(mockCountsPerStatus)

      const options = {
        method: 'GET',
        url: '/statistics?queryNameInvalid=countsPerStatus'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('route returns 400 if invalid param value', async () => {
      getCountsPerStatus.mockResolvedValue(mockCountsPerStatus)

      const options = {
        method: 'GET',
        url: '/statistics?queryName=invalidQuery'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('route returns 500 if db error', async () => {
      getCountsPerStatus.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'GET',
        url: '/statistics?queryName=countsPerStatus'
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
