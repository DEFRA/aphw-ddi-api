const { DuplicateResourceError } = require('../../../../app/errors/duplicate-record')

describe('Police force endpoint', () => {
  const { forces: mockForces } = require('../../../mocks/police-forces')

  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/auth/get-user')
  const { getCallingUser } = require('../../../../app/auth/get-user')

  jest.mock('../../../../app/repos/police-forces')
  const { getPoliceForces, addForce } = require('../../../../app/repos/police-forces')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  describe('GET /police-force', () => {
    test('GET /police-force route returns 200', async () => {
      getPoliceForces.mockResolvedValue(mockForces)

      const options = {
        method: 'GET',
        url: '/police-forces'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('GET /police-force route returns forces', async () => {
      getPoliceForces.mockResolvedValue(mockForces)

      const options = {
        method: 'GET',
        url: '/police-forces'
      }

      const response = await server.inject(options)
      const { policeForces } = JSON.parse(response.payload)

      expect(policeForces).toHaveLength(3)
      expect(policeForces).toContainEqual({ id: 1, name: 'Northern Constabulary' })
      expect(policeForces).toContainEqual({ id: 2, name: 'Southern Constabulary' })
      expect(policeForces).toContainEqual({ id: 3, name: 'Eastern Constabulary' })
    })

    test('GET /police-force route returns 500 if db error', async () => {
      getPoliceForces.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'GET',
        url: '/police-forces'
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /police-force', () => {
    getCallingUser.mockReturnValue({
      username: 'internal-user',
      displayname: 'User, Internal'
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    test('should return 201', async () => {
      addForce.mockResolvedValue({
        id: 2,
        name: 'Gondor Constabulary'
      })
      const options = {
        method: 'POST',
        url: '/police-forces',
        payload: {
          name: 'Gondor Constabulary'
        }
      }

      const response = await server.inject(options)
      const court = JSON.parse(response.payload)
      expect(response.statusCode).toBe(201)

      expect(court).toEqual({
        id: 2,
        name: 'Gondor Constabulary'
      })
    })

    test('should return a 400 given schema is invalid', async () => {
      const options = {
        method: 'POST',
        url: '/police-forces',
        payload: {}
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('should return 409 given DuplicateResourceError error', async () => {
      addForce.mockRejectedValue(new DuplicateResourceError())

      const options = {
        method: 'POST',
        url: '/police-forces',
        payload: {
          name: 'Gondor Constabulary'
        }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
    })

    test('should return 500 given db error', async () => {
      addForce.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'POST',
        url: '/police-forces',
        payload: {
          name: 'Gondor Constabulary'
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
