const { forces } = require('../../../mocks/police-forces')

describe('Healthy test', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/police-forces')
  const { getForces } = require('../../../../app/repos/police-forces')

  getForces.mockResolvedValue(forces)

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET /police-force route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/police-forces'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /police-force route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/police-forces'
    }

    const response = await server.inject(options)
    const { forces } = JSON.parse(response.payload)

    expect(forces).toHaveLength(3)
    expect(forces).toContain('Northern Constabulary')
    expect(forces).toContain('Southern Constabulary')
    expect(forces).toContain('Eastern Constabulary')
  })

  afterEach(async () => {
    await server.stop()
  })
})
