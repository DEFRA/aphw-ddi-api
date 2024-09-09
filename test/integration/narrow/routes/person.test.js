const { mockValidate } = require('../../../mocks/auth')
const { portalHeader } = require('../../../mocks/jwt')

describe('CDO endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/people')
  const { getPersonByReference, getPersonAndDogsByReference, updatePerson, deletePerson } = require('../../../../app/repos/people')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')
  validate.mockResolvedValue(mockValidate)

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /person route returns 200 with valid payload', async () => {
    const options = {
      method: 'GET',
      url: '/person/ABC123',
      ...portalHeader
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
      ],
      person_contacts: [
        {
          contact: {
            id: 1,
            contact_type: { contact_type: 'Email' },
            contact: 'test@example.com'
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
      },
      contacts: {
        emails: [
          'test@example.com'
        ],
        primaryTelephones: [],
        secondaryTelephones: []
      }
    })
  })

  test('GET /person route returns 204 with no payload', async () => {
    const options = {
      method: 'GET',
      url: '/person/ABC123',
      ...portalHeader
    }

    getPersonByReference.mockResolvedValue(null)

    const response = await server.inject(options)

    expect(response.statusCode).toBe(204)
  })

  test('GET /person route returns 400 with missing param', async () => {
    const options = {
      method: 'GET',
      url: '/person/',
      ...portalHeader
    }

    getPersonByReference.mockResolvedValue(null)

    const response = await server.inject(options)

    expect(response.statusCode).toBe(400)
  })

  test('GET /person route with param includeDogs returns 200 with valid payload', async () => {
    const options = {
      method: 'GET',
      url: '/person/ABC123?includeDogs=true',
      ...portalHeader
    }

    getPersonAndDogsByReference.mockResolvedValue([
      {
        id: 1,
        person_id: 1,
        dog_id: 100,
        person: {
          first_name: 'John',
          last_name: 'Doe',
          birth_date: '1990-01-01',
          person_reference: 'ABC123',
          addresses: [{
            address: {
              address_line_1: '1 Test Street',
              address_line_2: 'Test2',
              town: 'Test town',
              postcode: 'TS1 1TS',
              country: { country: 'England' }
            }
          }],
          person_contacts: [
            { contact: { id: 1, contact: 'phone' } }
          ]
        },
        dog: {
          id: 1, name: 'dog1', dog_breed: { breed: 'breed1' }, status: { status: 'NEW' }
        }
      },
      {
        id: 1,
        person_id: 1,
        dog_id: 100,
        person: {
          first_name: 'John',
          last_name: 'Doe',
          birth_date: '1990-01-01',
          person_reference: 'ABC123',
          addresses: [{
            address: {
              address_line_1: '1 Test Street',
              address_line_2: 'Test2',
              town: 'Test town',
              postcode: 'TS1 1TS',
              country: { country: 'England' }
            }
          }],
          person_contacts: [
            { contact: { id: 1, contact: 'phone' } }
          ]
        },
        dog: {
          id: 2, name: 'dog2', dog_breed: { breed: 'breed2' }, status: { status: 'NEW' }
        }
      }
    ]
    )

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
    expect(response.result).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      birthDate: '1990-01-01',
      personReference: 'ABC123',
      address: {
        addressLine1: '1 Test Street',
        addressLine2: 'Test2',
        town: 'Test town',
        postcode: 'TS1 1TS',
        country: 'England'
      },
      contacts: [{ contact: { id: 1, contact: 'phone' } }],
      dogs: [
        { id: 1, microchipNumber: null, microchipNumber2: null, breed: 'breed1', name: 'dog1', status: 'NEW' },
        { id: 2, microchipNumber: null, microchipNumber2: null, breed: 'breed2', name: 'dog2', status: 'NEW' }
      ]
    })
  })

  test('PUT /person route returns 200 with valid payload', async () => {
    const options = {
      method: 'PUT',
      url: '/person',
      payload: {
        personReference: 'ABC123',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        address: {
          addressLine1: '1 Test Street',
          addressLine2: 'Test',
          town: 'Test',
          postcode: 'TE1 1ST',
          country: 'England'
        }
      },
      ...portalHeader
    }

    updatePerson.mockResolvedValue({
      person_reference: 'ABC123',
      first_name: 'John',
      last_name: 'Doe',
      birth_date: '1990-01-01',
      addresses: [{
        address: {
          address_line_1: '1 Test Street',
          address_line_2: 'Test',
          town: 'Test',
          postcode: 'TE1 1ST',
          country: { country: 'England' }
        }
      }]
    })

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
    expect(updatePerson).toHaveBeenCalledTimes(1)
    expect(response.result).toEqual({
      personReference: 'ABC123',
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
      contacts: []
    })
  })

  test('PUT /person route returns 400 with invalid payload', async () => {
    const options = {
      method: 'PUT',
      url: '/person',
      payload: {
        firstName: 'John',
        lastName: 'Doe',
        address: {
          addressLine1: '1 Test Street',
          addressLine2: 'Test',
          town: 'Test',
          postcode: 'TE1 1ST',
          country: 'England'
        }
      },
      ...portalHeader
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(400)
  })

  test('PUT /person route returns 400 if person not found', async () => {
    const options = {
      method: 'PUT',
      url: '/person',
      payload: {
        personReference: 'ABC123',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        address: {
          addressLine1: '1 Test Street',
          addressLine2: 'Test',
          town: 'Test',
          postcode: 'TE1 1ST',
          country: 'England'
        }
      },
      ...portalHeader
    }

    updatePerson.mockRejectedValue({
      type: 'NOT_FOUND'
    })

    const response = await server.inject(options)

    expect(response.statusCode).toBe(400)
  })

  test('PUT /person route throws if error other than NOT_FOUND', async () => {
    const options = {
      method: 'PUT',
      url: '/person',
      payload: {
        personReference: 'ABC123',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        address: {
          addressLine1: '1 Test Street',
          addressLine2: 'Test',
          town: 'Test',
          postcode: 'TE1 1ST',
          country: 'England'
        }
      },
      ...portalHeader
    }

    updatePerson.mockImplementation(() => { throw new Error('DB error') })

    const response = await server.inject(options)

    expect(response.statusCode).toBe(500)
  })

  test('DELETE /person route returns 200 with valid payload', async () => {
    const options = {
      method: 'DELETE',
      url: '/person/P-12345',
      ...portalHeader
    }

    getPersonAndDogsByReference.mockResolvedValue()
    deletePerson.mockResolvedValue()

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
  })

  test('DELETE /person route returns 400 with missing param', async () => {
    const options = {
      method: 'DELETE',
      url: '/person/',
      ...portalHeader
    }

    getPersonAndDogsByReference.mockResolvedValue()
    deletePerson.mockResolvedValue()

    const response = await server.inject(options)

    expect(response.statusCode).toBe(400)
  })

  test('DELETE /person route returns 400 when owner has dogs', async () => {
    const options = {
      method: 'DELETE',
      url: '/person/P-123',
      ...portalHeader
    }

    deletePerson.mockResolvedValue()

    getPersonAndDogsByReference.mockResolvedValue([
      {
        id: 1,
        person_id: 1,
        dog_id: 100,
        person: {
          first_name: 'John',
          last_name: 'Doe',
          birth_date: '1990-01-01',
          person_reference: 'ABC123',
          addresses: [{
            address: {
              address_line_1: '1 Test Street',
              address_line_2: 'Test2',
              town: 'Test town',
              postcode: 'TS1 1TS',
              country: { country: 'England' }
            }
          }],
          person_contacts: [
            { contact: { id: 1, contact: 'phone' } }
          ]
        },
        dog: {
          id: 1, name: 'dog1', dog_breed: { breed: 'breed1' }, status: { status: 'NEW' }
        }
      }
    ])

    const response = await server.inject(options)

    expect(response.statusCode).toBe(400)
  })

  afterEach(async () => {
    await server.stop()
  })
})
