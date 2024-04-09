const { comments: mockComments } = require('../../../mocks/comments')
// const { sendEvent } = require

describe('Process Comments endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/comments')
  const { getComments, removeComment } = require('../../../../app/repos/comments')

  jest.mock('../../../../app/import/access/backlog/send-comment-event')
  const { sendCommentEvent } = require('../../../../app/import/access/backlog/send-comment-event')

  getComments.mockResolvedValue(mockComments)

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /process-comments returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/process-comments'
    }

    const response = await server.inject(options)
    const payload = JSON.parse(response.payload)

    expect(response.statusCode).toBe(200)
    expect(getComments).toBeCalledWith(undefined)
    expect(payload.rowsProcessed).toBe(3)
    expect(payload.rowsInError).toBe(0)
    expect(payload.rowsPublishedToEvents).toBe(3)
    expect(sendCommentEvent).toBeCalledTimes(3)
    expect(removeComment).toBeCalledTimes(3)
  })

  test('GET /process-comments limits to maxRecords', async () => {
    const options = {
      method: 'GET',
      url: '/process-comments?maxRecords=10'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(getComments).toBeCalledWith(10)
  })

  test('GET /process-comments returns 200 given error exists in removeComment', async () => {
    const options = {
      method: 'GET',
      url: '/process-comments'
    }

    removeComment.mockRejectedValueOnce(new Error('test error'))

    const response = await server.inject(options)
    const payload = JSON.parse(response.payload)

    expect(response.statusCode).toBe(200)
    expect(getComments).toBeCalledWith(undefined)
    expect(payload.rowsProcessed).toBe(3)
    expect(payload.rowsPublishedToEvents).toBe(2)
    expect(payload.rowsInError).toBe(1)
  })

  test('GET /process-comments returns 200 given error exists in sendCommentEvent', async () => {
    const options = {
      method: 'GET',
      url: '/process-comments'
    }
    sendCommentEvent.mockRejectedValueOnce(new Error('send comment error'))

    const response = await server.inject(options)
    const payload = JSON.parse(response.payload)

    expect(response.statusCode).toBe(200)
    expect(getComments).toBeCalledWith(undefined)
    expect(removeComment).toBeCalledTimes(2)
    expect(payload.rowsProcessed).toBe(3)
    expect(payload.rowsPublishedToEvents).toBe(2)
    expect(payload.rowsInError).toBe(1)
  })
  afterEach(async () => {
    await server.stop()
  })
})
