describe('Dog endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/dogs')
  const { getDogByIndexNumber, addImportedDog, updateDog, deleteDogByIndexNumber } = require('../../../../app/repos/dogs')

  jest.mock('../../../../app/repos/people')
  const { getOwnerOfDog } = require('../../../../app/repos/people')

  jest.mock('../../../../app/auth/get-user')
  const { getCallingUser } = require('../../../../app/auth/get-user')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /dog/ED123 route returns 200', async () => {
    getDogByIndexNumber.mockResolvedValue({ id: 123, indexNumber: 'ED123' })

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

  test('GET /dog-owner/ED123 route returns 200', async () => {
    getOwnerOfDog.mockResolvedValue({ person: { id: 123, personReference: 'P-123' } })

    const options = {
      method: 'GET',
      url: '/dog-owner/ED123'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
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
    expect(deleteDogByIndexNumber).toBeCalledWith('ED123', { displayname: 'User, Internal', username: 'internal-user' })
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

  test('DELETE /dog/ED123 route returns 404 with invalid dog index', async () => {
    getDogByIndexNumber.mockRejectedValue(new Error('500 error'))

    const options = {
      method: 'DELETE',
      url: '/dog/ED123'
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(500)
    expect(deleteDogByIndexNumber).not.toHaveBeenCalled()
  })

  afterEach(async () => {
    await server.stop()
  })
})
