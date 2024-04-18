describe('Courts endpoint', () => {
  const { courts: mockCourts } = require('../../../mocks/courts')

  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/courts')
  const { getCourts } = require('../../../../app/repos/courts')

  jest.mock('../../../../app/auth/get-user')
  const { getCallingUser } = require('../../../../app/auth/get-user')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  describe('GET /courts', () => {
    test('should return 200', async () => {
      getCourts.mockResolvedValue(mockCourts)

      const options = {
        method: 'GET',
        url: '/courts'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('should return courts', async () => {
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

    test('should return 500 given db error', async () => {
      getCourts.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'GET',
        url: '/courts'
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /courts', () => {
    test('should return 201', async () => {
      getCourts.mockResolvedValue(mockCourts)
      getCallingUser.mockReturnValue({
        username: 'internal-user',
        displayname: 'User, Internal'
      })

      const options = {
        method: 'GET',
        url: '/courts',
        payload: {
          name: 'Hobbiton County Court'
        }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(201)
      expect(response.payload).toEqual({

      })
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
