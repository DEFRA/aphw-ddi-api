const { mockValidate } = require('../../../mocks/auth')
const { portalHeader, apiHeader } = require('../../../mocks/jwt')

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
      ...portalHeader
    }

    sendEventToAudit.mockResolvedValue()

    const response = await server.inject(options)

    expect(response.statusCode).toBe(204)
    expect(sendEventToAudit).toHaveBeenCalled()
  })

  test('GET /export-create-file route returns 204 and calls createExportFile given call from portal', async () => {
    const options = {
      method: 'GET',
      url: '/export-create-file',
      ...portalHeader
    }

    runExportNow.mockResolvedValue('Success')

    const response = await server.inject(options)

    expect(response.statusCode).toBe(204)
    expect(runExportNow).toHaveBeenCalled()
  })

  test('GET /export-create-file route returns 204 and calls createExportFile given call from api', async () => {
    const options = {
      method: 'GET',
      url: '/export-create-file',
      ...apiHeader
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
