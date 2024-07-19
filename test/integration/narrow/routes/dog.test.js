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

  jest.mock('../../../../app/auth/get-user')
  const { getCallingUser } = require('../../../../app/auth/get-user')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  describe('GET /dog/ED123', () => {
    test('GET /dog/ED123 route returns 200', async () => {
      getDogByIndexNumber.mockResolvedValue({ id: 123, indexNumber: 'ED123', dog_breaches: [] })

      const options = {
        method: 'GET',
        url: '/dog/ED123'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('GET /dog/ED123 route returns 404 if dog does not exist', async () => {
      getDogByIndexNumber.mockResolvedValue(null)

      const options = {
        method: 'GET',
        url: '/dog/ED000'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('GET /dog/ED123 route returns 500 if db error', async () => {
      getDogByIndexNumber.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'GET',
        url: '/dog/ED123'
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  describe('GET /dog-owner/ED123', () => {
    test('GET /dog-owner/ED123 route returns 200', async () => {
      getOwnerOfDog.mockResolvedValue({ person: { id: 123, personReference: 'P-123' } })

      const options = {
        method: 'GET',
        url: '/dog-owner/ED123'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('GET /dog-owner/ED123?includeDogs=true route returns 200', async () => {
      getPersonAndDogsByIndex.mockResolvedValue({
        person: {
          id: 123,
          personReference: 'P-123',
          addresses: [
            {
              address: {
                address_line_1: 'address line 1',
                country: { id: 1, country: 'England' }
              }
            }
          ],
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
        }
      })

      const options = {
        method: 'GET',
        url: '/dog-owner/ED123?includeDogs=true'
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
        url: '/dog-owner/ED000'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('GET /dog-owner/ED123 route returns 404 if dog does not exist', async () => {
      getDogByIndexNumber.mockResolvedValue(null)

      const options = {
        method: 'GET',
        url: '/dog-owner/ED000'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('GET /dog-owner/ED123 route returns 500 if db error', async () => {
      getOwnerOfDog.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'GET',
        url: '/dog-owner/ED123'
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
        payload: {}
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(400)
    })

    test('POST /dog route returns 200 with valid payload', async () => {
      addImportedDog.mockResolvedValue()

      const options = {
        method: 'POST',
        url: '/dog',
        payload: { dog: { name: 'Bruno' } }
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
    })
  })

  describe('PUT /dog', () => {
    test('PUT /dog route returns 400 with invalid payload', async () => {
      updateDog.mockResolvedValue()

      const options = {
        method: 'PUT',
        url: '/dog',
        payload: {}
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(400)
    })

    test('PUT /dog route returns 500 with db error', async () => {
      updateDog.mockImplementation(() => { throw new Error('dog error') })

      const options = {
        method: 'PUT',
        url: '/dog',
        payload: { indexNumber: 'ABC123' }
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })

    test('PUT /dog route returns 200 with valid payload', async () => {
      updateDog.mockResolvedValue()

      const options = {
        method: 'PUT',
        url: '/dog',
        payload: { indexNumber: 'ABC123' }
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
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
        url: '/dog/ED123'
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(204)
      expect(deleteDogByIndexNumber).toBeCalledWith('ED123', {
        displayname: 'User, Internal',
        username: 'internal-user'
      })
    })

    test('DELETE /dog/ED123 route returns 404 with invalid dog index', async () => {
      getDogByIndexNumber.mockResolvedValue(null)

      const options = {
        method: 'DELETE',
        url: '/dog/ED123'
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(404)
      expect(deleteDogByIndexNumber).not.toHaveBeenCalled()
    })

    test('DELETE /dog/ED123 route returns 500 given server error', async () => {
      getDogByIndexNumber.mockRejectedValue(new Error('500 error'))

      const options = {
        method: 'DELETE',
        url: '/dog/ED123'
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
        url: '/dog/ED123'
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  describe('GET /dogs', () => {
    test('/dogs?forPurging=true returns 200 for step 1', async () => {
      getOldDogs.mockResolvedValue([{ dog_id: 123, dog: { id: 123, index_number: 'ED123' } }])

      const options = {
        method: 'GET',
        url: '/dogs?forPurging=true&statuses=Exempt,Inactive,Withdrawn,Failed'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(getOldDogs).toHaveBeenCalledWith('Exempt,Inactive,Withdrawn,Failed', { sortKey: undefined, sortOrder: undefined }, undefined)
    })

    test('/dogs?forPurging=true returns 200 for step 2', async () => {
      getOldDogs.mockResolvedValue([{ dog_id: 123, dog: { id: 123, index_number: 'ED123' } }])

      const options = {
        method: 'GET',
        url: '/dogs?forPurging=true&statuses=In breach,Pre-exempt,Interim exempt'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(getOldDogs).toHaveBeenCalledWith('In breach,Pre-exempt,Interim exempt', { sortKey: undefined, sortOrder: undefined }, undefined)
    })

    test('/dogs?forPurging=true returns 200 when sort params', async () => {
      getOldDogs.mockResolvedValue([{ dog_id: 123, dog: { id: 123, index_number: 'ED123' } }])

      const options = {
        method: 'GET',
        url: '/dogs?forPurging=true&statuses=Exempt,Inactive,Withdrawn,Failed&sortKey=status&sortOrder=DESC'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(getOldDogs).toHaveBeenCalledWith('Exempt,Inactive,Withdrawn,Failed', { sortKey: 'status', sortOrder: 'DESC' }, undefined)
    })

    test('/dogs?forPurging=true returns 200 and handle date override', async () => {
      getOldDogs.mockResolvedValue([{ dog_id: 123, dog: { id: 123, index_number: 'ED123' } }])

      const options = {
        method: 'GET',
        url: '/dogs?forPurging=true&statuses=Exempt,Inactive,Withdrawn,Failed&today=2000-05-01'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(getOldDogs).toHaveBeenCalledWith('Exempt,Inactive,Withdrawn,Failed', { sortKey: undefined, sortOrder: undefined }, new Date(Date.UTC(2000, 4, 1)))
    })

    test('/dogs returns 200 but doesnt call getOldDogs', async () => {
      getOldDogs.mockResolvedValue([{ dog_id: 123, dog: { id: 123, index_number: 'ED123' } }])

      const options = {
        method: 'GET',
        url: '/dogs'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(getOldDogs).not.toHaveBeenCalled()
    })

    test('/dogs returns 400 when bad param', async () => {
      getOldDogs.mockResolvedValue([{ dog_id: 123, dog: { id: 123, index_number: 'ED123' } }])

      const options = {
        method: 'GET',
        url: '/dogs?invalid=true'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
      expect(getOldDogs).not.toHaveBeenCalled()
    })
  })

  describe('POST /dogs:batch-delete', () => {
    test('should return a 200 with list of deleted persons', async () => {
      const expectedDogs = ['ED300006', 'ED300053']
      const expectedUser = {
        username: 'internal-user',
        displayname: 'User, Internal'
      }
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
      getCallingUser.mockReturnValue(expectedUser)
      const options = {
        method: 'POST',
        url: '/dogs:batch-delete',
        payload: {
          dogPks: expectedDogs
        }
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expect(payload.deleted.success).toEqual(expectedDogs)
      expect(deleteDogs).toHaveBeenCalledWith(expectedDogs, expectedUser)
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
        }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('should return 400 given invalid payload', async () => {
      const options = {
        method: 'POST',
        url: '/dogs:batch-delete',
        payload: {}
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(400)
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
