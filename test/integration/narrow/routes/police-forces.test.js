const { DuplicateResourceError } = require('../../../../app/errors/duplicate-record')
const { NotFoundError } = require('../../../../app/errors/not-found')
const { mockValidate, mockValidateEnforcement, mockValidateStandard } = require('../../../mocks/auth')
const { portalHeader, enforcementHeader, portalStandardHeader } = require('../../../mocks/jwt')

describe('Police force endpoint', () => {
  const { forces: mockForces } = require('../../../mocks/police-forces')

  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/auth/get-user')
  const { getCallingUser } = require('../../../../app/auth/get-user')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')

  jest.mock('../../../../app/repos/police-forces')
  const { getPoliceForces, addForce, deleteForce, getPoliceForceByShortName } = require('../../../../app/repos/police-forces')

  beforeEach(async () => {
    jest.clearAllMocks()
    validate.mockResolvedValue(mockValidate)
    server = await createServer()
    await server.initialize()
  })

  describe('GET /police-forces', () => {
    test('GET /police-force route returns 200', async () => {
      getPoliceForces.mockResolvedValue(mockForces)

      const options = {
        method: 'GET',
        url: '/police-forces',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('GET /police-force route returns forces', async () => {
      getPoliceForces.mockResolvedValue(mockForces)

      const options = {
        method: 'GET',
        url: '/police-forces',
        ...portalHeader
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
        url: '/police-forces',
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /police-forces', () => {
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
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      const court = JSON.parse(response.payload)
      expect(response.statusCode).toBe(201)

      expect(court).toEqual({
        id: 2,
        name: 'Gondor Constabulary'
      })
    })

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/police-forces',
        payload: {
          name: 'Gondor Constabulary'
        },
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should return 403 given call from standard user', async () => {
      validate.mockResolvedValue(mockValidateStandard)

      const options = {
        method: 'POST',
        url: '/police-forces',
        payload: {
          name: 'Gondor Constabulary'
        },
        ...portalStandardHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should return a 400 given schema is invalid', async () => {
      const options = {
        method: 'POST',
        url: '/police-forces',
        payload: {},
        ...portalHeader
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
        },
        ...portalHeader
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
        },
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  describe('DELETE /police-forces', () => {
    getCallingUser.mockReturnValue({
      username: 'internal-user',
      displayname: 'User, Internal'
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    test('should return 204', async () => {
      deleteForce.mockResolvedValue({
        id: 1,
        name: 'Gondor Constabulary'
      })
      const options = {
        method: 'DELETE',
        url: '/police-forces/1',
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(204)

      expect(response.payload).toBe('')
    })

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'DELETE',
        url: '/police-forces/1',
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should return 403 given call from standard user', async () => {
      validate.mockResolvedValue(mockValidateStandard)

      const options = {
        method: 'DELETE',
        url: '/police-forces/1',
        ...portalStandardHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should return 409 given NotFoundError error', async () => {
      deleteForce.mockRejectedValue(new NotFoundError())

      const options = {
        method: 'DELETE',
        url: '/police-forces/1',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('should return 500 given db error', async () => {
      deleteForce.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'DELETE',
        url: '/police-forces/1',
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  describe('GET /police-force-by-short-name', () => {
    afterEach(() => {
      jest.resetAllMocks()
    })

    test('route returns 200', async () => {
      getPoliceForceByShortName.mockResolvedValue(mockForces[0])

      const options = {
        method: 'GET',
        url: '/police-force-by-short-name/abcdef',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('returns force', async () => {
      getPoliceForceByShortName.mockResolvedValue(mockForces[1])

      const options = {
        method: 'GET',
        url: '/police-force-by-short-name/abcdef',
        ...portalHeader
      }

      const response = await server.inject(options)
      const { policeForce } = JSON.parse(response.payload)

      expect(policeForce).toEqual({ id: 1, name: 'Northern Constabulary' })
    })

    test('route returns 500 if db error', async () => {
      getPoliceForceByShortName.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'GET',
        url: '/police-force-by-short-name/abcdef',
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
