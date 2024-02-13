const { activities: mockActivities } = require('../../../mocks/activities')

describe('Activity endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/activity')
  const { getActivityList, getActivityById } = require('../../../../app/repos/activity')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /activities/sent/dog route returns 200', async () => {
    getActivityList.mockResolvedValue(mockActivities)

    const options = {
      method: 'GET',
      url: '/activities/sent/dog'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /activities/sent/dog route returns 500 if db error', async () => {
    getActivityList.mockRejectedValue(new Error('Test error'))

    const options = {
      method: 'GET',
      url: '/activities/sent/dog'
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(500)
  })

  test('GET /activity/1 route returns 200', async () => {
    getActivityById.mockResolvedValue(mockActivities[0])

    const options = {
      method: 'GET',
      url: '/activity/1'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /activity/1 route returns 500 if db error', async () => {
    getActivityById.mockRejectedValue(new Error('Test error'))

    const options = {
      method: 'GET',
      url: '/activity/1'
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(500)
  })

  /*
  test('POST /activity route returns 400 with invalid payload', async () => {
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
  */
  afterEach(async () => {
    await server.stop()
  })
})
