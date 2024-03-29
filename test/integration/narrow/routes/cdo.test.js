const { payload: mockCreatePayload, payloadWithPersonReference: mockCreateWithRefPayload } = require('../../../mocks/cdo/create')
const { NotFoundError } = require('../../../../app/errors/notFound')

describe('CDO endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/cdo')
  const { createCdo, getCdo } = require('../../../../app/repos/cdo')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /cdo/ED123 route returns 200', async () => {
    getCdo.mockResolvedValue({
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
    })

    const options = {
      method: 'GET',
      url: '/cdo/ED123'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /cdo/ED123 route returns 500 when error', async () => {
    getCdo.mockImplementation(() => { throw new Error('cdo error') })

    const options = {
      method: 'GET',
      url: '/cdo/ED123'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(500)
  })

  test('POST /cdo route returns 200 with valid payload', async () => {
    const options = {
      method: 'POST',
      url: '/cdo',
      payload: mockCreatePayload
    }

    createCdo.mockResolvedValue({
      owner: {
        first_name: 'John',
        last_name: 'Doe',
        birth_date: '1990-01-01',
        address: {
          address_line_1: '1 Test Street',
          address_line_2: 'Test',
          town: 'Test',
          postcode: 'TE1 1ST',
          country: {
            country: 'England'
          }
        },
        person_reference: '1234'
      },
      dogs: [
        {
          index_number: 'ED10000',
          name: 'Test Dog',
          dog_breed: {
            breed: 'Test Breed'
          },
          registration: {
            police_force: {
              name: 'Test Police Force'
            },
            court: {
              name: 'Test Court'
            },
            cdo_issued: '2020-01-01',
            cdo_expiry: '2020-02-01',
            legislation_officer: 'Test Officer'
          }
        }
      ]
    })

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(response.result).toEqual({
      owner: {
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '1990-01-01',
        address: {
          addressLine1: '1 Test Street',
          addressLine2: 'Test',
          town: 'Test',
          postcode: 'TE1 1ST',
          country: 'England'
        },
        personReference: '1234'
      },
      enforcementDetails: {
        policeForce: 'Test Police Force',
        court: 'Test Court',
        legislationOfficer: 'Test Officer'
      },
      dogs: [
        {
          indexNumber: 'ED10000',
          name: 'Test Dog',
          breed: 'Test Breed',
          cdoIssued: '2020-01-01',
          cdoExpiry: '2020-02-01'
        }
      ]
    })
  })

  test('POST /cdo route returns 200 with valid payload and personReference', async () => {
    const options = {
      method: 'POST',
      url: '/cdo',
      payload: mockCreateWithRefPayload
    }

    createCdo.mockResolvedValue({
      owner: {
        first_name: 'John',
        last_name: 'Doe',
        birth_date: '1990-01-01',
        address: {
          address_line_1: '1 Test Street',
          address_line_2: 'Test',
          town: 'Test',
          postcode: 'TE1 1ST',
          country: {
            country: 'England'
          }
        },
        person_reference: 'P-6076-A37C'
      },
      dogs: [
        {
          index_number: 'ED10000',
          name: 'Test Dog',
          dog_breed: {
            breed: 'Test Breed'
          },
          registration: {
            police_force: {
              name: 'Test Police Force'
            },
            court: {
              name: 'Test Court'
            },
            cdo_issued: '2020-01-01',
            cdo_expiry: '2020-02-01',
            legislation_officer: 'Test Officer'
          }
        }
      ]
    })

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(response.result).toEqual({
      owner: {
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '1990-01-01',
        address: {
          addressLine1: '1 Test Street',
          addressLine2: 'Test',
          town: 'Test',
          postcode: 'TE1 1ST',
          country: 'England'
        },
        personReference: 'P-6076-A37C'
      },
      enforcementDetails: {
        policeForce: 'Test Police Force',
        court: 'Test Court',
        legislationOfficer: 'Test Officer'
      },
      dogs: [
        {
          indexNumber: 'ED10000',
          name: 'Test Dog',
          breed: 'Test Breed',
          cdoIssued: '2020-01-01',
          cdoExpiry: '2020-02-01'
        }
      ]
    })
  })

  test('POST /cdo route returns 422 with invalid personReference', async () => {
    const options = {
      method: 'POST',
      url: '/cdo',
      payload: mockCreateWithRefPayload
    }

    createCdo.mockRejectedValue(new NotFoundError('Owner not found'))

    const response = await server.inject(options)

    expect(response.statusCode).toBe(422)
  })

  test('POST /cdo route returns 400 with invalid payload', async () => {
    const options = {
      method: 'POST',
      url: '/cdo',
      payload: {}
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(400)
  })

  test('POST /cdo route returns 500 if db error', async () => {
    createCdo.mockRejectedValue(new Error('Test error'))

    const options = {
      method: 'POST',
      url: '/cdo',
      payload: mockCreatePayload
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(500)
  })
})
