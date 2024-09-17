const { countsPerStatus: mockCountsPerStatus, countsPerCountry: mockCountsPerCountry } = require('../../../mocks/statistics')
const { breeds: mockBreeds } = require('../../../mocks/dog-breeds')
const { mockValidate } = require('../../../mocks/auth')
const { portalHeader } = require('../../../mocks/jwt')

describe('Statistics endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/statistics')
  const { getCountsPerStatus, getCountsPerCountry } = require('../../../../app/repos/statistics')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')
  validate.mockResolvedValue(mockValidate)

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
        url: '/statistics?queryName=countsPerStatus',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.result[0].status.name).toBe('Interim exempt')
      expect(response.result[0].total).toBe(20)
      expect(response.result[1].status.name).toBe('Pre-exempt')
      expect(response.result[1].total).toBe(30)
      expect(response.result[2].status.name).toBe('Failed')
      expect(response.result[2].total).toBe(40)
      expect(response.result[3].status.name).toBe('Exempt')
      expect(response.result[3].total).toBe(500)
      expect(response.result[4].status.name).toBe('In breach')
      expect(response.result[4].total).toBe(60)
      expect(response.result[5].status.name).toBe('Withdrawn')
      expect(response.result[5].total).toBe(70)
      expect(response.result[6].status.name).toBe('Inactive')
      expect(response.result[6].total).toBe(80)
    })

    test('route returns 400 if invalid param key name', async () => {
      getCountsPerStatus.mockResolvedValue(mockCountsPerStatus)

      const options = {
        method: 'GET',
        url: '/statistics?queryNameInvalid=countsPerStatus',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('route returns 400 if invalid param value', async () => {
      getCountsPerStatus.mockResolvedValue(mockCountsPerStatus)

      const options = {
        method: 'GET',
        url: '/statistics?queryName=invalidQuery',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('route returns 500 if db error', async () => {
      getCountsPerStatus.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'GET',
        url: '/statistics?queryName=countsPerStatus',
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })

    describe('GET /statistics?queryName=countsPerCountry', () => {
      test('route returns 200', async () => {
        getCountsPerCountry.mockResolvedValue({ counts: mockCountsPerCountry, breeds: mockBreeds })

        const options = {
          method: 'GET',
          url: '/statistics?queryName=countsPerCountry',
          ...portalHeader
        }

        const response = await server.inject(options)
        expect(response.statusCode).toBe(200)
        expect(response.result[0].breed).toBe('Breed 1')
        expect(response.result[0].country).toBe('England')
        expect(response.result[0].total).toBe(55)
        expect(response.result[1].breed).toBe('Breed 1')
        expect(response.result[1].country).toBe('Wales')
        expect(response.result[1].total).toBe(2)
        expect(response.result[2].breed).toBe('Breed 1')
        expect(response.result[2].country).toBe('Scotland')
        expect(response.result[2].total).toBe(30)
        expect(response.result[3].breed).toBe('Breed 2')
        expect(response.result[3].country).toBe('England')
        expect(response.result[3].total).toBe(257)
        expect(response.result[4].breed).toBe('Breed 2')
        expect(response.result[4].country).toBe('Wales')
        expect(response.result[4].total).toBe(0)
        expect(response.result[5].breed).toBe('Breed 2')
        expect(response.result[5].country).toBe('Scotland')
        expect(response.result[5].total).toBe(10)
        expect(response.result[6].breed).toBe('Breed 3')
        expect(response.result[6].country).toBe('England')
        expect(response.result[6].total).toBe(0)
        expect(response.result[7].breed).toBe('Breed 3')
        expect(response.result[7].country).toBe('Wales')
        expect(response.result[7].total).toBe(128)
        expect(response.result[8].breed).toBe('Breed 3')
        expect(response.result[8].country).toBe('Scotland')
        expect(response.result[8].total).toBe(0)
      })

      test('route returns 500 if db error', async () => {
        getCountsPerCountry.mockRejectedValue(new Error('Test error'))

        const options = {
          method: 'GET',
          url: '/statistics?queryName=countsPerCountry',
          ...portalHeader
        }

        const response = await server.inject(options)

        expect(response.statusCode).toBe(500)
      })
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
