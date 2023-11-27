const { breeds } = require('../../../mocks/dog-breeds')

describe('Healthy test', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/dog')
  const { getBreeds } = require('../../../../app/repos/dog')

  getBreeds.mockResolvedValue(breeds)

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET /dog-breeds route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/dog-breeds'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /dog-breeds route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/dog-breeds'
    }

    const response = await server.inject(options)
    const { breeds } = JSON.parse(response.payload)

    expect(breeds).toHaveLength(3)
    expect(breeds).toContain('Breed 1')
    expect(breeds).toContain('Breed 2')
    expect(breeds).toContain('Breed 3')
  })

  afterEach(async () => {
    await server.stop()
  })
})
