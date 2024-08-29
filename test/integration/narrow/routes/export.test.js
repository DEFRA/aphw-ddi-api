const { mockValidate, authHeaders } = require('../../../mocks/auth')
const { validate } = require('../../../../app/auth/token-validator')
describe('Export endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/overnight/run-jobs')
  const { runExportNow } = require('../../../../app/overnight/run-jobs')

  jest.mock('../../../../app/messaging/send-audit')
  const { sendEventToAudit } = require('../../../../app/messaging/send-audit')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')

  beforeEach(async () => {
    jest.clearAllMocks()
    validate.mockResolvedValue(mockValidate)
    server = await createServer()
    await server.initialize()
  })

  test('GET /export-audit route returns 204 and calls sendEventToAudit', async () => {
    const options = {
      method: 'GET',
      url: '/export-audit',
      ...authHeaders
    }

    sendEventToAudit.mockResolvedValue()

    const response = await server.inject(options)

    expect(response.statusCode).toBe(204)
    expect(sendEventToAudit).toHaveBeenCalled()
  })

  test('GET /export-create-file route returns 204 and calls createExportFile', async () => {
    const options = {
      method: 'GET',
      url: '/export-create-file',
      ...authHeaders
    }

    runExportNow.mockResolvedValue('Success')

    const response = await server.inject(options)

    expect(response.statusCode).toBe(204)
    expect(runExportNow).toHaveBeenCalled()
  })

  afterEach(async () => {
    await server.stop()
  })
})
