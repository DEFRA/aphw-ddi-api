const { activities: mockActivities } = require('../../../mocks/activities')
const { devUser, mockValidate, authHeaders } = require('../../../mocks/auth')
const { portalHeader } = require('../../../mocks/jwt')

describe('Activity endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')
  validate.mockResolvedValue(mockValidate)

  jest.mock('../../../../app/auth/get-user')
  const { getCallingUser } = require('../../../../app/auth/get-user')

  jest.mock('../../../../app/repos/activity')
  const { getActivityList, getActivityById, createActivity, deleteActivity } = require('../../../../app/repos/activity')

  jest.mock('../../../../app/messaging/send-audit')
  const { sendActivityToAudit } = require('../../../../app/messaging/send-audit')

  jest.mock('../../../../app/service/config')
  const { getCdoService } = require('../../../../app/service/config')

  beforeEach(async () => {
    jest.clearAllMocks()
    getCallingUser.mockReturnValue(devUser)
    server = await createServer()
    await server.initialize()
  })

  describe('GET /activities', () => {
    test('/sent/dog route returns 200', async () => {
      getActivityList.mockResolvedValue(mockActivities)

      const options = {
        method: 'GET',
        url: '/activities/sent/dog',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('/sent/dog route returns 500 if db error', async () => {
      getActivityList.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'GET',
        url: '/activities/sent/dog',
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  describe('GET /activity', () => {
    test('/1 route returns 200', async () => {
      getActivityById.mockResolvedValue(mockActivities[0])

      const options = {
        method: 'GET',
        url: '/activity/1',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('/1 route returns 500 if db error', async () => {
      getActivityById.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'GET',
        url: '/activity/1',
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /activity', () => {
    test('returns 400 with invalid payload', async () => {
      sendActivityToAudit.mockResolvedValue()

      const options = {
        method: 'POST',
        url: '/activity',
        payload: {},
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(400)
    })

    test('returns 200 with valid payload', async () => {
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
        },
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
    })

    test('returns 200 with Application Pack sent', async () => {
      const sendApplicationPackMock = jest.fn()
      getCdoService.mockReturnValue({
        sendApplicationPack: sendApplicationPackMock
      })
      sendApplicationPackMock.mockResolvedValue(undefined)

      getActivityById.mockResolvedValue({ id: 9, name: 'act 1', label: 'Application pack' })

      const activityDate = new Date()
      const options = {
        method: 'POST',
        url: '/activity',
        payload: {
          activity: '9',
          activityType: 'sent',
          pk: 'ED300000',
          source: 'dog',
          activityDate
        },
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
      expect(sendActivityToAudit).not.toHaveBeenCalled()
      expect(sendApplicationPackMock).toHaveBeenCalledWith('ED300000', activityDate, devUser)
    })

    test('returns 200 with Application Pack received', async () => {
      sendActivityToAudit.mockResolvedValue()

      getActivityById.mockResolvedValue({ id: 9, name: 'act 1', label: 'Application pack' })

      const options = {
        method: 'POST',
        url: '/activity',
        payload: {
          activity: '9',
          activityType: 'received',
          pk: 'ED300000',
          source: 'dog',
          activityDate: new Date()
        },
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
      expect(sendActivityToAudit).toHaveBeenCalled()
    })

    test('returns 200 with Form 2 sent', async () => {
      const sendForm2Mock = jest.fn()
      getCdoService.mockReturnValue({
        sendForm2: sendForm2Mock
      })
      sendForm2Mock.mockResolvedValue(undefined)

      getActivityById.mockResolvedValue({ id: 10, name: 'act 1', label: 'Form 2' })

      const activityDate = new Date()
      const options = {
        method: 'POST',
        url: '/activity',
        payload: {
          activity: '10',
          activityType: 'sent',
          pk: 'ED300000',
          source: 'dog',
          activityDate
        },
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
      expect(sendActivityToAudit).not.toHaveBeenCalled()
      expect(sendForm2Mock).toHaveBeenCalledWith('ED300000', activityDate, devUser)
    })

    test('returns 200 with Form 2 received', async () => {
      sendActivityToAudit.mockResolvedValue()

      getActivityById.mockResolvedValue({ id: 10, name: 'act 1', label: 'Form 2' })

      const options = {
        method: 'POST',
        url: '/activity',
        payload: {
          activity: '10',
          activityType: 'received',
          pk: 'ED300000',
          source: 'dog',
          activityDate: new Date()
        },
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(200)
      expect(sendActivityToAudit).toHaveBeenCalled()
    })

    test('returns 400 with invalid payload', async () => {
      sendActivityToAudit.mockResolvedValue()

      const options = {
        method: 'POST',
        url: '/activity',
        payload: {},
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(400)
    })
  })

  describe('POST /activities', () => {
    test('returns 400 with invalid payload', async () => {
      const options = {
        method: 'POST',
        url: '/activities',
        payload: {},
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(400)
    })

    test('returns 201 with valid payload', async () => {
      createActivity.mockResolvedValue({
        activityType: 'sent',
        activitySource: 'dog',
        label: 'New activity',
        id: 12345
      })

      const options = {
        method: 'POST',
        url: '/activities',
        payload: {
          activityType: 'sent',
          activitySource: 'dog',
          label: 'New activivty'
        },
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(201)
    })
  })

  describe('DELETE /activities', () => {
    test('returns 404 with missing url param', async () => {
      const options = {
        method: 'DELETE',
        url: '/activities',
        payload: {},
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(404)
    })

    test('returns 204 with valid url param', async () => {
      deleteActivity.mockResolvedValue()

      const options = {
        method: 'DELETE',
        url: '/activities/123',
        payload: {},
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(204)
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
