describe('CDO endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/cdo')
  const { getCdo } = require('../../../../app/repos/cdo')

  jest.mock('../../../../app/storage/repos/certificate')
  jest.mock('../../../../app/storage/repos/certificate-template')
  jest.mock('../../../../app/generator/certificate')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('POST /certificate returns 200 with valid payload', async () => {
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
          id: 456,
          first_name: 'first',
          last_name: 'last',
          birth_date: '2000-01-01',
          addresses: [{
            address_line_1: 'line1',
            address_line_2: 'line2',
            town: 'town',
            postcode: 'postcode',
            country: {
              country: 'country'
            }
          }],
          person_contacts: [{
            contact: {
              contact_type: {
                contact_type: 'EMAIL'
              },
              contact_value: 'email'
            }
          }]
        }
      }]
    })

    const options = {
      method: 'POST',
      url: '/certificate',
      payload: {
        indexNumber: 'ED123'
      }
    }

    const response = await server.inject(options)

    expect(response.statusCode).toEqual(201)
    expect(response.result).toEqual({ certificateId: expect.any(String) })
  })

  test('POST /certificate returns 400 with invalid payload', async () => {
    const options = {
      method: 'POST',
      url: '/certificate'
    }

    const response = await server.inject(options)

    expect(response.statusCode).toEqual(400)
  })

  test('POST /certificate returns 500 if exception thrown', async () => {
    getCdo.mockRejectedValue(new Error('test error'))

    const options = {
      method: 'POST',
      url: '/certificate',
      payload: {
        indexNumber: 'ED123'
      }
    }

    const response = await server.inject(options)

    expect(response.statusCode).toEqual(500)
  })

  afterEach(async () => {
    await server.stop()
  })
})
