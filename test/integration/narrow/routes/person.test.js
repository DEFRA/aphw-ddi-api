const { mockValidate, mockValidateEnforcement, mockValidateStandard } = require('../../../mocks/auth')
const { portalHeader, enforcementHeader, portalStandardHeader } = require('../../../mocks/jwt')

describe('CDO endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/people')
  const { getPersonByReference, getPersonAndDogsByReference, updatePerson, deletePerson } = require('../../../../app/repos/people')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')

  jest.mock('../../../../app/dto/auditing/view')
  const { auditOwnerActivityView, auditOwnerDetailsView } = require('../../../../app/dto/auditing/view')

  jest.mock('../../../../app/repos/police-force-helper')
  const { hasForceChanged } = require('../../../../app/repos/police-force-helper')

  beforeEach(async () => {
    jest.clearAllMocks()
    validate.mockResolvedValue(mockValidate)
    server = await createServer()
    await server.initialize()
  })

  describe('GET /person', () => {
    test('should return 200 with valid payload', async () => {
      const options = {
        method: 'GET',
        url: '/person/ABC123',
        ...portalHeader
      }

      const person = {
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
      }
      getPersonByReference.mockResolvedValue(person)

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
      expect(auditOwnerActivityView).toHaveBeenCalledWith(person, expect.objectContaining({
        displayname: 'dev-user@test.com',
        username: 'dev-user@test.com'
      }))
    })

    test('should return 204 with no payload', async () => {
      const options = {
        method: 'GET',
        url: '/person/ABC123',
        ...portalHeader
      }

      getPersonByReference.mockResolvedValue(null)

      const response = await server.inject(options)

      expect(response.statusCode).toBe(204)
    })

    test('should return 400 with missing param', async () => {
      const options = {
        method: 'GET',
        url: '/person/',
        ...portalHeader
      }

      getPersonByReference.mockResolvedValue(null)

      const response = await server.inject(options)

      expect(response.statusCode).toBe(400)
    })

    test('with param includeDogs should return 200 with valid payload', async () => {
      const options = {
        method: 'GET',
        url: '/person/ABC123?includeDogs=true',
        ...portalHeader
      }
      const registeredPersonList = [
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

      getPersonAndDogsByReference.mockResolvedValue(registeredPersonList)

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
          { id: 1, microchipNumber: null, microchipNumber2: null, breed: 'breed1', name: 'dog1', status: 'NEW', subStatus: null },
          { id: 2, microchipNumber: null, microchipNumber2: null, breed: 'breed2', name: 'dog2', status: 'NEW', subStatus: null }
        ]
      })
      expect(auditOwnerDetailsView).toHaveBeenCalledWith(registeredPersonList, expect.objectContaining({
        username: 'dev-user@test.com',
        displayname: 'dev-user@test.com',
        origin: 'aphw-ddi-portal'
      }))
    })
  })

  describe('PUT /person', () => {
    test('should return 200 with valid payload', async () => {
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
        updatedPerson: {
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
        }
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

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

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
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should return 400 with invalid payload', async () => {
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

    test('should return 400 if person not found', async () => {
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

    test('should throw if error other than NOT_FOUND', async () => {
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
  })

  describe('PUT /person-and-force-change', () => {
    test('PUT /person-and-force-change route returns 200 with valid payload', async () => {
      const options = {
        method: 'PUT',
        url: '/person-and-force-change',
        payload: {
          personReference: 'ABC123',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          address: {
            addressLine1: '1 Test Street changed',
            addressLine2: 'Test',
            town: 'Test',
            postcode: 'TE1 1ST',
            country: 'England'
          }
        },
        ...portalHeader
      }

      updatePerson.mockResolvedValue({
        updatedPerson: {
          person_reference: 'ABC123',
          first_name: 'John',
          last_name: 'Doe',
          birth_date: '1990-01-01',
          addresses: [{
            address: {
              address_line_1: '1 Test Street changed',
              address_line_2: 'Test',
              town: 'Test',
              postcode: 'TE1 1ST',
              country: { country: 'England' }
            }
          }]
        },
        changedPoliceForceResult: {
          changed: true,
          policeForceName: 'New force',
          numOfDogs: 1
        }
      })

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
      expect(updatePerson).toHaveBeenCalledTimes(1)
      expect(response.result).toEqual({
        person: {
          personReference: 'ABC123',
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '1990-01-01',
          address: {
            addressLine1: '1 Test Street changed',
            addressLine2: 'Test',
            town: 'Test',
            postcode: 'TE1 1ST',
            country: 'England'
          },
          contacts: []
        },
        policeForceResult: {
          changed: true,
          policeForceName: 'New force',
          numOfDogs: 1
        }
      })
    })

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'PUT',
        url: '/person-and-force-change',
        payload: {
          personReference: 'ABC123',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          address: {
            addressLine1: '1 Test Street changed',
            addressLine2: 'Test',
            town: 'Test',
            postcode: 'TE1 1ST',
            country: 'England'
          }
        },
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('PUT /person-and-force-change route returns 400 with invalid payload', async () => {
      hasForceChanged.mockResolvedValue()
      const options = {
        method: 'PUT',
        url: '/person-and-force-change',
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

    test('PUT /person-and-force-change route returns 400 if person not found', async () => {
      hasForceChanged.mockResolvedValue()
      const options = {
        method: 'PUT',
        url: '/person-and-force-change',
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

    test('PUT /person-and-force-change route throws if error other than NOT_FOUND', async () => {
      hasForceChanged.mockResolvedValue()
      const options = {
        method: 'PUT',
        url: '/person-and-force-change',
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
  })

  describe('DELETE /person ', () => {
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

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'DELETE',
        url: '/person/P-12345',
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should return 403 given call from standard user', async () => {
      validate.mockResolvedValue(mockValidateStandard)

      const options = {
        method: 'DELETE',
        url: '/person/P-12345',
        ...portalStandardHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
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
  })

  afterEach(async () => {
    await server.stop()
  })
})
