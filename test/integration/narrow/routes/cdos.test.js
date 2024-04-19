describe('CDO endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/cdo')
  const { getCdos } = require('../../../../app/repos/cdo')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /cdos route returns 200', async () => {
    getCdos.mockResolvedValue([{
      id: 123,
      indexNumber: 'ED123',
      dog_breed: {
        breed: 'breed1'
      },
      status: {
        status: 'NEW'
      },
      registration: {
        court: {
          name: 'court1'
        },
        police_force: {
          name: 'force1'
        },
        exemption_order: {
          exemption_order: 2015
        }
      },
      registered_person: [{
        person: {
        }
      }]
    }])

    const options = {
      method: 'GET',
      url: '/cdos'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /cdo/ED123 route returns 500 when error', async () => {
    getCdos.mockImplementation(() => { throw new Error('cdo error') })

    const options = {
      method: 'GET',
      url: '/cdo/ED123'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(500)
  })
})
