const { comments: mockComments } = require('../../../mocks/comments')

describe('Process Comments endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/comments')
  const { getComments, removeComment } = require('../../../../app/repos/comments')

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

    getComments.mockResolvedValue(mockComments)

    const response = await server.inject(options)
    const payload = JSON.parse(response.payload)

    expect(response.statusCode).toBe(200)
    expect(getComments).toBeCalledWith(undefined)
    expect(payload.rowsProcessed).toBe(3)
    expect(payload.rowsInError).toBe(0)
  })

  test('GET /process-comments limits to maxRecords', async () => {
    const options = {
      method: 'GET',
      url: '/process-comments?maxRecords=10'
    }

    getComments.mockResolvedValue(mockComments)

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(getComments).toBeCalledWith(10)
  })

  test('GET /process-comments returns 200 given errors exist', async () => {
    const options = {
      method: 'GET',
      url: '/process-comments'
    }

    getComments.mockResolvedValue(mockComments)
    removeComment.mockRejectedValueOnce(new Error('test error'))

    const response = await server.inject(options)
    const payload = JSON.parse(response.payload)

    expect(response.statusCode).toBe(200)
    expect(getComments).toBeCalledWith(undefined)
    expect(payload.rowsProcessed).toBe(3)
    expect(payload.rowsInError).toBe(1)
  })
  afterEach(async () => {
    await server.stop()
  })
})
