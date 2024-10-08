const { breeds: mockBreeds } = require('../../../mocks/dog-breeds')
const { mockValidate } = require('../../../mocks/auth')
const { portalHeader } = require('../../../mocks/jwt')

describe('Dog breeds endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/dogs')
  const { getBreeds } = require('../../../../app/repos/dogs')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')

  beforeEach(async () => {
    validate.mockResolvedValue(mockValidate)
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /dog-breeds route returns 200', async () => {
    getBreeds.mockResolvedValue(mockBreeds)

    const options = {
      method: 'GET',
      url: '/dog-breeds',
      ...portalHeader
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /dog-breeds route returns 200', async () => {
    getBreeds.mockResolvedValue(mockBreeds)

    const options = {
      method: 'GET',
      url: '/dog-breeds',
      ...portalHeader
    }

    const response = await server.inject(options)
    const { breeds } = JSON.parse(response.payload)

    expect(breeds).toHaveLength(3)
    expect(breeds).toContainEqual({ id: 1, breed: 'Breed 1' })
    expect(breeds).toContainEqual({ id: 2, breed: 'Breed 2' })
    expect(breeds).toContainEqual({ id: 3, breed: 'Breed 3' })
  })

  test('GET /dog-breeds route returns 500 if db error', async () => {
    getBreeds.mockRejectedValue(new Error('Test error'))

    const options = {
      method: 'GET',
      url: '/dog-breeds',
      ...portalHeader
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(500)
  })

  afterEach(async () => {
    await server.stop()
  })
})
