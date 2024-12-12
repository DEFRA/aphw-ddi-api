const { mockValidate, mockValidateEnforcement } = require('../../../mocks/auth')
const { portalHeader, enforcementHeader } = require('../../../mocks/jwt')
const { getSummaryCdos, getCdoCounts } = require('../../../../app/repos/cdo')

describe('CDO endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/cdo')
  const { getSummaryCdos, getCdoCounts } = require('../../../../app/repos/cdo')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')

  beforeEach(async () => {
    validate.mockResolvedValue(mockValidate)
    server = await createServer()
    await server.initialize()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('GET /cdos route returns 200', async () => {
    const expectedCdos = [
      {
        person: {
          id: 10,
          firstName: 'Scott',
          lastName: 'Pilgrim',
          personReference: 'P-1234-5678'
        },
        dog: {
          id: 300013,
          dogReference: 'ED300013',
          status: 'Pre-exempt'
        },
        exemption: {
          policeForce: 'Cheshire Constabulary',
          cdoExpiry: '2024-03-01',
          joinedExemptionScheme: null,
          nonComplianceLetterSent: '2024-04-01'
        }
      }
    ]
    getSummaryCdos.mockResolvedValue({
      count: 1,
      cdos: [
        {
          id: 300013,
          index_number: 'ED300013',
          status_id: 5,
          registered_person: [
            {
              id: 13,
              person: {
                id: 10,
                first_name: 'Scott',
                last_name: 'Pilgrim',
                person_reference: 'P-1234-5678'
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
            joined_exemption_scheme: null,
            non_compliance_letter_sent: '2024-04-01',
            police_force: {
              id: 5,
              name: 'Cheshire Constabulary'
            }
          }
        }
      ]
    })
    getCdoCounts.mockResolvedValue({
      preExempt: {
        total: 1,
        within30: 1
      },
      failed: {
        nonComplianceLetterNotSent: 10
      }
    })

    const options = {
      method: 'GET',
      url: '/cdos?status=PreExempt',
      ...portalHeader
    }

    const expectedFilter = { status: ['PreExempt'] }

    const expectedPayload = {
      cdos: expectedCdos,
      count: 1,
      counts: {
        preExempt: {
          total: 1,
          within30: 1
        },
        failed: {
          nonComplianceLetterNotSent: 10
        }
      }
    }

    const response = await server.inject(options)
    const { payload } = response
    expect(response.statusCode).toBe(200)
    expect(getSummaryCdos).toHaveBeenCalledWith(expectedFilter, undefined)
    expect(JSON.parse(payload)).toEqual(expectedPayload)
  })

  test('GET /cdos route returns 200 given police force is missing', async () => {
    const expectedCdos = [
      {
        person: {
          id: 10,
          firstName: 'Scott',
          lastName: 'Pilgrim',
          personReference: 'P-1234-5678'
        },
        dog: {
          id: 300013,
          dogReference: 'ED300013',
          status: 'Pre-exempt'
        },
        exemption: {
          policeForce: null,
          cdoExpiry: '2024-03-01',
          joinedExemptionScheme: null,
          nonComplianceLetterSent: '2024-04-01'
        }
      }
    ]
    getSummaryCdos.mockResolvedValue({
      count: 1,
      cdos: [
        {
          id: 300013,
          index_number: 'ED300013',
          status_id: 5,
          registered_person: [
            {
              id: 13,
              person: {
                id: 10,
                first_name: 'Scott',
                last_name: 'Pilgrim',
                person_reference: 'P-1234-5678'
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
            joined_exemption_scheme: null,
            non_compliance_letter_sent: '2024-04-01',
            police_force: null
          }
        }
      ]
    })
    getCdoCounts.mockResolvedValue({
      preExempt: {
        total: 1,
        within30: 1
      },
      failed: {
        nonComplianceLetterNotSent: 10
      }
    })
    const options = {
      method: 'GET',
      url: '/cdos?status=PreExempt',
      ...portalHeader
    }

    const expectedPayload = {
      cdos: expectedCdos,
      count: 1,
      counts: {
        preExempt: {
          total: 1,
          within30: 1
        },
        failed: {
          nonComplianceLetterNotSent: 10
        }
      }
    }

    const response = await server.inject(options)
    const { payload } = response
    expect(response.statusCode).toBe(200)
    expect(JSON.parse(payload)).toEqual(expectedPayload)
  })

  test('GET /cdos route returns 200 when called with multiple status', async () => {
    getSummaryCdos.mockResolvedValue({
      count: 0,
      cdos: []
    })
    getCdoCounts.mockResolvedValue({
      preExempt: {
        total: 0,
        within30: 0
      },
      failed: {
        nonComplianceLetterNotSent: 0
      }
    })
    const options = {
      method: 'GET',
      url: '/cdos?status=PreExempt&status=InterimExempt',
      ...portalHeader
    }

    const expectedFilter = { status: ['PreExempt', 'InterimExempt'] }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(getSummaryCdos).toHaveBeenCalledWith(expectedFilter, undefined)
  })

  test('GET /cdos route returns 200 given withinDays filter applied', async () => {
    getSummaryCdos.mockResolvedValue({
      count: 0,
      cdos: []
    })
    getCdoCounts.mockResolvedValue({
      preExempt: {
        total: 0,
        within30: 0
      },
      failed: {
        nonComplianceLetterNotSent: 0
      }
    })
    const options = {
      method: 'GET',
      url: '/cdos?withinDays=30',
      ...portalHeader
    }

    const expectedFilter = { withinDays: 30 }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(getSummaryCdos).toHaveBeenCalledWith(expectedFilter, undefined)
  })

  test('GET /cdos route returns 200 given nonComplianceLetterSent false filter applied', async () => {
    getSummaryCdos.mockResolvedValue({
      count: 0,
      cdos: []
    })
    getCdoCounts.mockResolvedValue({
      preExempt: {
        total: 0,
        within30: 0
      },
      failed: {
        nonComplianceLetterNotSent: 0
      }
    })
    const options = {
      method: 'GET',
      url: '/cdos?status=Failed&nonComplianceLetterSent=false',
      ...portalHeader
    }

    const expectedFilter = { status: ['Failed'], nonComplianceLetterSent: false }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(getSummaryCdos).toHaveBeenCalledWith(expectedFilter, undefined)
  })

  test('GET /cdos route returns 200 given sorting requested', async () => {
    getSummaryCdos.mockResolvedValue({
      count: 0,
      cdos: []
    })
    getCdoCounts.mockResolvedValue({
      preExempt: {
        total: 0,
        within30: 0
      },
      failed: {
        nonComplianceLetterNotSent: 0
      }
    })
    const options = {
      method: 'GET',
      url: '/cdos?status=InterimExempt&sortKey=joinedExemptionScheme&sortOrder=DESC',
      ...portalHeader
    }

    const expectedFilter = { status: ['InterimExempt'] }
    const expectedOrdering = { key: 'joinedExemptionScheme', order: 'DESC' }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(getSummaryCdos).toHaveBeenCalledWith(expectedFilter, expectedOrdering)
  })

  test('should return 403 given call from enforcement', async () => {
    validate.mockResolvedValue(mockValidateEnforcement)

    const options = {
      method: 'GET',
      url: '/cdos?status=PreExempt',
      ...enforcementHeader
    }
    const response = await server.inject(options)
    expect(response.statusCode).toBe(403)
  })

  test('GET /cdos route returns 400 given no filter applied', async () => {
    const options = {
      method: 'GET',
      url: '/cdos',
      ...portalHeader
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(400)
  })

  test('GET /cdos route returns 400 given incorrect data returned', async () => {
    getSummaryCdos.mockResolvedValue({
      count: 1,
      cdos: [
        {
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
            joined_exemption_scheme: null,
            police_force: {
              id: 5,
              name: 'Cheshire Constabulary'
            }
          }
        }
      ]
    })

    const options = {
      method: 'GET',
      url: '/cdos?status=PreExempt',
      ...portalHeader
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(400)
  })

  test('GET /cdos route returns 500 when error', async () => {
    getSummaryCdos.mockImplementation(() => { throw new Error('cdo error') })

    const options = {
      method: 'GET',
      url: '/cdos?status=PreExempt',
      ...portalHeader
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(500)
  })
})
