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
    }]
    getSummaryCdos.mockResolvedValue(expectedCdos)

    const options = {
      method: 'GET',
      url: '/cdos'
    }

    const expectedFilter = {}
    const expectedPayload = {
      cdos: expectedCdos
    }

    const response = await server.inject(options)
    const { payload } = response
    expect(response.statusCode).toBe(200)
    expect(getSummaryCdos).toHaveBeenCalledWith(expectedFilter)
    expect(JSON.parse(payload)).toEqual(expectedPayload)
  })

  test('GET /cdos route returns 200 given status filter applied', async () => {
    const options = {
      method: 'GET',
      url: '/cdos?status=PreExempt'
    }

    const expectedFilter = { status: ['PreExempt'] }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(getSummaryCdos).toHaveBeenCalledWith(expectedFilter)
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
      url: '/cdos'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(500)
  })
})
