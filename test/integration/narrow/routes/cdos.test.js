describe('CDO endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/cdo')
  const { getSummaryCdos } = require('../../../../app/repos/cdo')
  getSummaryCdos.mockResolvedValue([])

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('GET /cdos route returns 200', async () => {
    const expectedCdos = [{
      id: 300013,
      index_number: 'ED300013',
      status_id: 5,
      registered_person: [
        {
          id: 13,
          person: {
            id: 10,
            first_name: 'Scott',
            last_name: 'Pilgrim'
          }
        }
      ],
      status: {
        id: 5,
        status: 'Pre-exempt',
        status_type: 'STANDARD'
      },
      registration: {
        id: 13,
        cdo_expiry: '2024-03-01',
        police_force: {
          id: 5,
          name: 'Cheshire Constabulary'
        }
      }
    }]
    getSummaryCdos.mockResolvedValue(expectedCdos)

    const options = {
      method: 'GET',
      url: '/cdos?status=PreExempt'
    }

    const expectedFilter = { status: ['PreExempt'] }

    const expectedPayload = {
      cdos: expectedCdos
    }

    const response = await server.inject(options)
    const { payload } = response
    expect(response.statusCode).toBe(200)
    expect(getSummaryCdos).toHaveBeenCalledWith(expectedFilter)
    expect(JSON.parse(payload)).toEqual(expectedPayload)
  })

  test('GET /cdos route returns 200 when called with multiple status', async () => {
    const options = {
      method: 'GET',
      url: '/cdos?status=PreExempt&status=InterimExempt'
    }

    const expectedFilter = { status: ['PreExempt', 'InterimExempt'] }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(getSummaryCdos).toHaveBeenCalledWith(expectedFilter)
  })

  test('GET /cdos route returns 501 given no filter applied', async () => {
    const options = {
      method: 'GET',
      url: '/cdos'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(501)
  })

  test('GET /cdos route returns 200 given withinDays filter applied', async () => {
    const options = {
      method: 'GET',
      url: '/cdos?withinDays=30'
    }

    const expectedFilter = { withinDays: 30 }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(getSummaryCdos).toHaveBeenCalledWith(expectedFilter)
  })

  test('GET /cdos route returns 500 when error', async () => {
    getSummaryCdos.mockImplementation(() => { throw new Error('cdo error') })

    const options = {
      method: 'GET',
      url: '/cdos?status=PreExempt'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(500)
  })
})
