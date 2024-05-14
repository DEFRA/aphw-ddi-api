describe('Export endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/export/read-export-file')
  const { readExportFile } = require('../../../../app/export/read-export-file')

  jest.mock('../../../../app/repos/regular-jobs')
  const { runExportNow } = require('../../../../app/repos/regular-jobs')

  jest.mock('../../../../app/messaging/send-audit')
  const { sendEventToAudit } = require('../../../../app/messaging/send-audit')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /export route returns 200 and calls readExportFile', async () => {
    const options = {
      method: 'GET',
      url: '/export'
    }

    readExportFile.mockResolvedValue([])
    sendEventToAudit.mockResolvedValue()

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
    expect(readExportFile).toHaveBeenCalled()
  })

  test('GET /export-create-file route returns 200 and calls createExportFile', async () => {
    const options = {
      method: 'GET',
      url: '/export-create-file'
    }

    runExportNow.mockResolvedValue('Success')

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
    expect(runExportNow).toHaveBeenCalled()
  })

  afterEach(async () => {
    await server.stop()
  })
})
