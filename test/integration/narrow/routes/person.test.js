describe('CDO endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/people')
  const { getPersonByReference } = require('../../../../app/repos/people')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /person route returns 200 with valid payload', async () => {
    const options = {
      method: 'GET',
      url: '/person/ABC123'
    }

    getPersonByReference.mockResolvedValue({
      first_name: 'John',
      last_name: 'Doe',
      birth_date: '1990-01-01',
      person_reference: 'ABC123',
      addresses: [
        {
          address: {
            address_line_1: '1 Test Street',
            address_line_2: 'Test',
            town: 'Test',
            postcode: 'TE1 1ST',
            country: {
              country: 'England'
            }
          }
        }
      ]
    })

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
    expect(response.result).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      birthDate: '1990-01-01',
      personReference: 'ABC123',
      address: {
        addressLine1: '1 Test Street',
        addressLine2: 'Test',
        town: 'Test',
        postcode: 'TE1 1ST',
        country: 'England'
      }
    })
  })

  test('GET /person route returns 204 with no payload', async () => {
    const options = {
      method: 'GET',
      url: '/person/ABC123'
    }

    getPersonByReference.mockResolvedValue(null)

    const response = await server.inject(options)

    expect(response.statusCode).toBe(204)
  })

  afterEach(async () => {
    await server.stop()
  })
})
