describe('Get persons endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/persons')
  const { getPersons } = require('../../../../app/repos/persons')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  describe('GET /persons', () => {
    test('GET /persons route returns 200 with valid payload', async () => {
      const options = {
        method: 'GET',
        url: '/persons'
      }

      const expectedPersons = [{
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
          primaryTelephones: ['01234567890'],
          secondaryTelephones: ['07890123456']
        }
      }]

      getPersons.mockResolvedValue([{
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
          },
          {
            contact: {
              id: 2,
              contact_type: { contact_type: 'Phone' },
              contact: '01234567890'
            }
          },
          {
            contact: {
              id: 3,
              contact_type: { contact_type: 'SecondaryPhone' },
              contact: '07890123456'
            }
          }
        ]
      }])

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
      expect(response.result).toEqual({ persons: expectedPersons })
    })

    test('GET /persons with orphaned true route returns 200 with valid payload', async () => {
      const options = {
        method: 'GET',
        url: '/persons?orphaned=true'
      }

      getPersons.mockResolvedValue([])

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
      expect(getPersons).toHaveBeenCalledWith({ orphaned: true }, { sortOrder: 'ASC' })
    })

    test('GET /persons with orphaned true route with limit -1 returns 200 with valid payload', async () => {
      const options = {
        method: 'GET',
        url: '/persons?orphaned=true&limit=-1'
      }

      getPersons.mockResolvedValue([])

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
      expect(getPersons).toHaveBeenCalledWith({ orphaned: true }, { sortOrder: 'ASC', limit: -1 })
    })

    test('GET /persons with orphaned true, sortKey and sortOrder DESC returns 200 with valid payload', async () => {
      const options = {
        method: 'GET',
        url: '/persons?orphaned=true&limit=-1&sortKey=owner&sortOrder=DESC'
      }

      getPersons.mockResolvedValue([])

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
      expect(getPersons).toHaveBeenCalledWith({ orphaned: true }, { limit: -1, sortKey: 'owner', sortOrder: 'DESC' })
    })

    test('GET /persons with orphaned true, sortKey and sortOrder ASC returns 200 with valid payload', async () => {
      const options = {
        method: 'GET',
        url: '/persons?orphaned=true&limit=-1&sortKey=owner&sortOrder=ASC'
      }

      getPersons.mockResolvedValue([])

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
      expect(getPersons).toHaveBeenCalledWith({ orphaned: true }, { sortKey: 'owner', sortOrder: 'ASC', limit: -1 })
    })

    test('GET /persons with orphaned true, sortKey returns 200 with valid payload', async () => {
      const options = {
        method: 'GET',
        url: '/persons?orphaned=true&limit=-1&sortKey=owner'
      }

      getPersons.mockResolvedValue([])

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
      expect(getPersons).toHaveBeenCalledWith({ orphaned: true }, { sortKey: 'owner', sortOrder: 'ASC', limit: -1 })
    })

    test('GET /persons route with search params returns 200 with valid payload', async () => {
      const options = {
        method: 'GET',
        url: '/persons?firstName=Frodo&lastName=Baggins&dateOfBirth=2968-09-22'
      }

      getPersons.mockResolvedValue([])

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
      expect(response.result).toEqual({ persons: [] })
    })

    test('GET /persons route returns 400 given invalid params', async () => {
      const options = {
        method: 'GET',
        url: '/persons?unknownParam=test'
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(400)
    })
  })

  describe('DELETE /persons', () => {
    test('should return a 200 with list of deleted persons', async () => {
      const options = {
        method: 'DELETE',
        url: '/persons',
        payload: {
          personReferences: ['P-1234-567', 'P-2345-678']
        }
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expect(payload.persons).toEqual(['P-1234-567', 'P-2345-678'])
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
