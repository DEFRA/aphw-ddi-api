describe('Courts endpoint', () => {
  const { DuplicateResourceError } = require('../../../../app/errors/duplicate-record')
  const { courts: mockCourts } = require('../../../mocks/courts')

  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/courts')
  const { getCourts, createCourt } = require('../../../../app/repos/courts')

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
    getCallingUser.mockReturnValue({
      username: 'internal-user',
      displayname: 'User, Internal'
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    test('should return 201', async () => {
      createCourt.mockResolvedValue({
        id: 2,
        name: 'Gondor Crown Court'
      })
      const options = {
        method: 'POST',
        url: '/courts',
        payload: {
          name: 'Gondor Crown Court'
        }
      }

      const response = await server.inject(options)
      const court = JSON.parse(response.payload)
      expect(response.statusCode).toBe(201)

      expect(court).toEqual({
        id: 2,
        name: 'Gondor Crown Court'
      })
    })

    test('should return 409 given DuplicateResourceError error', async () => {
      createCourt.mockRejectedValue(new DuplicateResourceError())

      const options = {
        method: 'POST',
        url: '/courts',
        payload: {
          name: 'Gondor Crown Court'
        }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
    })

    test('should return 500 given db error', async () => {
      createCourt.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'POST',
        url: '/courts',
        payload: {
          name: 'Gondor Crown Court'
        }
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
