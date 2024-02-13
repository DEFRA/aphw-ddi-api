const { activities: mockActivities } = require('../../../mocks/activities')

describe('Activity endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/activity')
  const { getActivityList, getActivityById } = require('../../../../app/repos/activity')

  jest.mock('../../../../app/messaging/send-audit')
  const { sendActivityToAudit } = require('../../../../app/messaging/send-audit')

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

  test('POST /activity route returns 400 with invalid payload', async () => {
    sendActivityToAudit.mockResolvedValue()

    const options = {
      method: 'POST',
      url: '/activity',
      payload: {}
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(400)
  })

  test('POST /activity route returns 200 with valid payload', async () => {
    sendActivityToAudit.mockResolvedValue()
    getActivityById.mockResolvedValue({ id: 1, name: 'act 1', label: 'activity 1' })

    const options = {
      method: 'POST',
      url: '/activity',
      payload: {
        activity: '3',
        activityType: 'sent',
        pk: 'ED300000',
        source: 'dog',
        activityDate: new Date()
      }
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
  })

  test('POST /activity route returns 400 with invalid payload', async () => {
    sendActivityToAudit.mockResolvedValue()

    const options = {
      method: 'POST',
      url: '/activity',
      payload: {}
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(400)
  })

  afterEach(async () => {
    await server.stop()
  })
})
