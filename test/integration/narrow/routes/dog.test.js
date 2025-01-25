const { personDaoBuilder } = require('../../../mocks/person')
const { buildDogDao, buildRegistrationDao } = require('../../../mocks/cdo/get')
const { mockValidate, mockValidateEnforcement, mockValidateStandard } = require('../../../mocks/auth')
const { portalHeader, enforcementHeader, portalStandardHeader } = require('../../../mocks/jwt')

const internalUser = {
  username: 'internal-user',
  displayname: 'User, Internal'
}

describe('Dog endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/dogs')
  const {
    getDogByIndexNumber,
    addImportedDog,
    updateDog,
    deleteDogByIndexNumber,
    getOldDogs,
    deleteDogs
  } = require('../../../../app/repos/dogs')

  jest.mock('../../../../app/repos/people')
  const { getOwnerOfDog, getPersonAndDogsByIndex } = require('../../../../app/repos/people')

  jest.mock('../../../../app/service/config')
  const { getDogService } = require('../../../../app/service/config')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')

  jest.mock('../../../../app/auth/get-user')
  const { getCallingUser } = require('../../../../app/auth/get-user')

  beforeEach(async () => {
    jest.clearAllMocks()
    validate.mockResolvedValue(mockValidate)
    server = await createServer()
    await server.initialize()
  })

  describe('GET /dog/ED123', () => {
    test('GET /dog/ED123 route returns 200', async () => {
      getDogByIndexNumber.mockResolvedValue({ id: 123, indexNumber: 'ED123', dog_breaches: [] })

      const options = {
        method: 'GET',
        url: '/dog/ED123',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('GET /dog/ED123 route returns 404 if dog does not exist', async () => {
      getDogByIndexNumber.mockResolvedValue(null)

      const options = {
        method: 'GET',
        url: '/dog/ED000',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('GET /dog/ED123 route returns 500 if db error', async () => {
      getDogByIndexNumber.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'GET',
        url: '/dog/ED123',
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  describe('GET /dog-owner/ED123', () => {
    test('GET /dog-owner/ED123 route returns 200', async () => {
      getOwnerOfDog.mockResolvedValue({ person: personDaoBuilder({ id: 123, personReference: 'P-123' }) })

      const options = {
        method: 'GET',
        url: '/dog-owner/ED123',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('GET /dog-owner/ED123?includeDogs=true route returns 200', async () => {
      getPersonAndDogsByIndex.mockResolvedValue({
        person: personDaoBuilder({
          id: 123,
          personReference: 'P-123',
          person_contacts: [],
          registered_people: [
            {
              firstName: 'Ralph',
              lastName: 'Wreck it',
              dog: {
                id: 300724,
                dog_breed: { id: 1, breed: 'XL Bully' },
                status: { id: 1, status: 'Interim Exempt' }
              }
            }
          ]
        }),
        dogs: [
          {
            breed: 'XL Bully',
            colour: null,
            dogReference: '225c332e-ba51-4e17-becf-fe3880252cd6',
            id: 300095,
            indexNumber: 'ED300095',
            microchipNumber: null,
            microchipNumber2: null,
            name: 'Rex329',
            sex: null,
            status: {
              status: 'Interim exempt'
            },
            tattoo: null,
            birthDate: null
          }
        ]
      })

      const options = {
        method: 'GET',
        url: '/dog-owner/ED123?includeDogs=true',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)

      expect(payload.owner.dogs.length).toBeTruthy()
    })

    test('GET /dog-owner/ED123 route returns 404 if dog owner does not exist', async () => {
      getOwnerOfDog.mockResolvedValue(null)

      const options = {
        method: 'GET',
        url: '/dog-owner/ED000',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('GET /dog-owner/ED123 route returns 404 if dog does not exist', async () => {
      getDogByIndexNumber.mockResolvedValue(null)

      const options = {
        method: 'GET',
        url: '/dog-owner/ED000',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('GET /dog-owner/ED123 route returns 500 if db error', async () => {
      getOwnerOfDog.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'GET',
        url: '/dog-owner/ED123',
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /dog', () => {
    test('POST /dog route returns 400 with invalid payload', async () => {
      addImportedDog.mockResolvedValue()

      const options = {
        method: 'POST',
        url: '/dog',
        payload: {},
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(400)
    })

    test('POST /dog route returns 200 with valid payload', async () => {
      addImportedDog.mockResolvedValue()

      const options = {
        method: 'POST',
        url: '/dog',
        payload: { dog: { name: 'Bruno' } },
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
    })

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/dog',
        payload: { dog: { name: 'Bruno' } },
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })
  })

  describe('PUT /dog', () => {
    test('PUT /dog route returns 400 with invalid payload', async () => {
      updateDog.mockResolvedValue()

      const options = {
        method: 'PUT',
        url: '/dog',
        payload: {},
        ...portalHeader
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(400)
      expect(payload.errors.length).toBeGreaterThan(0)
    })

    test('PUT /dog route returns 400 with invalid response', async () => {
      updateDog.mockResolvedValue(buildDogDao({ id: 123, index_number: 'ABC123', status_id: 'bad' }))

      const options = {
        method: 'PUT',
        url: '/dog',
        payload: { indexNumber: 'ABC123' },
        ...portalHeader
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(400)
      expect(payload.errors.length).toBeGreaterThan(0)
      expect(payload.errors[0]).toBe('"status_id" must be a number')
    })

    test('PUT /dog route returns 500 with db error', async () => {
      updateDog.mockImplementation(() => { throw new Error('dog error') })

      const options = {
        method: 'PUT',
        url: '/dog',
        payload: { indexNumber: 'ABC123' },
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })

    test('PUT /dog route returns 200 with valid payload', async () => {
      updateDog.mockResolvedValue(buildDogDao({ id: 123, index_number: 'ABC123' }))

      const options = {
        method: 'PUT',
        url: '/dog',
        payload: { indexNumber: 'ABC123' },
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
    })

    test('PUT /dog route returns 200 with valid payload including microchips', async () => {
      updateDog.mockResolvedValue(buildDogDao(
        {
          id: 123,
          index_number: 'ABC123',
          dog_microchips: [
            { dog_id: 123, microchip_id: 1, microchip: { id: 111, microchip_number: '123451234512345' } }
          ]
        }))

      const options = {
        method: 'PUT',
        url: '/dog',
        payload: { indexNumber: 'ABC123' },
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
    })

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'PUT',
        url: '/dog',
        payload: { indexNumber: 'ABC123' },
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })
  })

  describe('DELETE /dog/ED123', () => {
    test('DELETE /dog/ED123 route returns 204 with valid index', async () => {
      getDogByIndexNumber.mockResolvedValue({ id: 123, indexNumber: 'ED123' })
      getCallingUser.mockReturnValue({
        username: 'internal-user',
        displayname: 'User, Internal'
      })

      const options = {
        method: 'DELETE',
        url: '/dog/ED123',
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(204)
      expect(deleteDogByIndexNumber).toBeCalledWith('ED123', {
        displayname: 'User, Internal',
        username: 'internal-user'
      })
    })

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'DELETE',
        url: '/dog/ED123',
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should return 403 given call from standard user', async () => {
      validate.mockResolvedValue(mockValidateStandard)

      const options = {
        method: 'DELETE',
        url: '/dog/ED123',
        ...portalStandardHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('DELETE /dog/ED123 route returns 404 with invalid dog index', async () => {
      getDogByIndexNumber.mockResolvedValue(null)

      const options = {
        method: 'DELETE',
        url: '/dog/ED123',
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(404)
      expect(deleteDogByIndexNumber).not.toHaveBeenCalled()
    })

    test('DELETE /dog/ED123 route returns 500 given server error', async () => {
      getDogByIndexNumber.mockRejectedValue(new Error('500 error'))

      const options = {
        method: 'DELETE',
        url: '/dog/ED123',
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
      expect(deleteDogByIndexNumber).not.toHaveBeenCalled()
    })

    test('DELETE /dog/ED123 route returns 500 given delete error', async () => {
      getDogByIndexNumber.mockResolvedValue({ id: 123, indexNumber: 'ED123' })
      deleteDogByIndexNumber.mockRejectedValue(new Error('500 error'))

      const options = {
        method: 'DELETE',
        url: '/dog/ED123',
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  describe('GET /dogs', () => {
    test('/dogs?forPurging=true returns 200 for step 1', async () => {
      getOldDogs.mockResolvedValue([{
        ...buildRegistrationDao({ dog_id: 123 }),
        dog: buildDogDao({ id: 123, index_number: 'ED123' })
      }])

      const options = {
        method: 'GET',
        url: '/dogs?forPurging=true&statuses=Exempt,Inactive,Withdrawn,Failed',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(getOldDogs).toHaveBeenCalledWith('Exempt,Inactive,Withdrawn,Failed', { sortKey: undefined, sortOrder: undefined }, undefined)
    })

    test('/dogs?forPurging=true returns 200 for step 2', async () => {
      getOldDogs.mockResolvedValue([{
        ...buildRegistrationDao({ dog_id: 123 }),
        dog: buildDogDao({ id: 123, index_number: 'ED123' })
      }])

      const options = {
        method: 'GET',
        url: '/dogs?forPurging=true&statuses=In breach,Pre-exempt,Interim exempt',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(getOldDogs).toHaveBeenCalledWith('In breach,Pre-exempt,Interim exempt', { sortKey: undefined, sortOrder: undefined }, undefined)
    })

    test('/dogs?forPurging=true returns 200 when sort params', async () => {
      getOldDogs.mockResolvedValue([{
        ...buildRegistrationDao({ dog_id: 123 }),
        dog: buildDogDao({ id: 123, index_number: 'ED123' })
      }])

      const options = {
        method: 'GET',
        url: '/dogs?forPurging=true&statuses=Exempt,Inactive,Withdrawn,Failed&sortKey=status&sortOrder=DESC',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(getOldDogs).toHaveBeenCalledWith('Exempt,Inactive,Withdrawn,Failed', { sortKey: 'status', sortOrder: 'DESC' }, undefined)
    })

    test('/dogs?forPurging=true returns 200 and handle date override', async () => {
      getOldDogs.mockResolvedValue([{
        ...buildRegistrationDao({ dog_id: 123 }),
        dog: buildDogDao({ id: 123, index_number: 'ED123' })
      }])

      const options = {
        method: 'GET',
        url: '/dogs?forPurging=true&statuses=Exempt,Inactive,Withdrawn,Failed&today=2000-05-01',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(getOldDogs).toHaveBeenCalledWith('Exempt,Inactive,Withdrawn,Failed', { sortKey: undefined, sortOrder: undefined }, new Date(Date.UTC(2000, 4, 1)))
    })

    test('/dogs returns 200 but doesnt call getOldDogs', async () => {
      getOldDogs.mockResolvedValue([{
        ...buildRegistrationDao({ dog_id: 123 }),
        dog: buildDogDao({ id: 123, index_number: 'ED123' })
      }])

      const options = {
        method: 'GET',
        url: '/dogs',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(getOldDogs).not.toHaveBeenCalled()
    })

    test('/dogs returns 400 when bad param', async () => {
      getOldDogs.mockResolvedValue([{
        ...buildRegistrationDao({ dog_id: 123 }),
        dog: buildDogDao({ id: 123, index_number: 'ED123' })
      }])

      const options = {
        method: 'GET',
        url: '/dogs?invalid=true',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
      expect(getOldDogs).not.toHaveBeenCalled()
    })
  })

  describe('POST /dogs:batch-delete', () => {
    test('should return a 200 with list of deleted persons', async () => {
      const expectedDogs = ['ED300006', 'ED300053']

      deleteDogs.mockResolvedValue({
        count: {
          failed: 0,
          success: 2
        },
        deleted: {
          failed: [],
          success: expectedDogs
        }
      })
      getCallingUser.mockReturnValue(internalUser)
      const options = {
        method: 'POST',
        url: '/dogs:batch-delete',
        payload: {
          dogPks: expectedDogs
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expect(payload.deleted.success).toEqual(expectedDogs)
      expect(deleteDogs).toHaveBeenCalledWith(expectedDogs, internalUser)
    })

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/dogs:batch-delete',
        payload: {
          dogPks: ['ED300006', 'ED300053']
        },
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should return 403 given call from standard user', async () => {
      validate.mockResolvedValue(mockValidateStandard)

      const options = {
        method: 'POST',
        url: '/dogs:batch-delete',
        payload: {
          dogPks: ['ED300006', 'ED300053']
        },
        ...portalStandardHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should return a 400 given invalid response payload', async () => {
      const expectedDogs = ['ED300006', 'ED300053']
      const expectedUser = {
        username: 'internal-user',
        displayname: 'User, Internal'
      }
      deleteDogs.mockResolvedValue({})
      getCallingUser.mockReturnValue(expectedUser)
      const options = {
        method: 'POST',
        url: '/dogs:batch-delete',
        payload: {
          dogPks: expectedDogs
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('should return 400 given invalid payload', async () => {
      const options = {
        method: 'POST',
        url: '/dogs:batch-delete',
        payload: {},
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(400)
    })
  })

  describe('POST /dog/withdraw', () => {
    test('POST /dog route returns 200 with valid dog', async () => {
      const withdrawDogMock = jest.fn()
      getDogService.mockReturnValue({
        withdrawDog: withdrawDogMock
      })
      withdrawDogMock.mockResolvedValue(undefined)

      const options = {
        method: 'POST',
        url: '/dog/withdraw/ED123',
        payload: {},
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
      expect(withdrawDogMock).toHaveBeenCalledWith({
        indexNumber: 'ED123',
        user: internalUser
      })
    })

    test('POST /dog route returns 200 with valid dog and update email', async () => {
      const withdrawDogMock = jest.fn()
      getDogService.mockReturnValue({
        withdrawDog: withdrawDogMock
      })
      withdrawDogMock.mockResolvedValue(undefined)

      const options = {
        method: 'POST',
        url: '/dog/withdraw/ED123',
        payload: {
          emailToUpdate: 'garrymcfadyen@hotmail.com'
        },
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
      expect(withdrawDogMock).toHaveBeenCalledWith({
        indexNumber: 'ED123',
        email: 'garrymcfadyen@hotmail.com',
        user: internalUser
      })
    })

    test('should return 403 given call from enforcement', async () => {
      const withdrawDogMock = jest.fn()
      getDogService.mockReturnValue({
        withdrawDog: withdrawDogMock
      })
      withdrawDogMock.mockResolvedValue(undefined)
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/dog/withdraw/ED123',
        payload: { },
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should throw if error withdrawing dog', async () => {
      const withdrawDogMock = jest.fn()
      getDogService.mockReturnValue({
        withdrawDog: withdrawDogMock
      })
      withdrawDogMock.mockImplementation(() => { throw new Error('Invalid dog') })

      const options = {
        method: 'POST',
        url: '/dog/withdraw/ED123',
        payload: { },
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
