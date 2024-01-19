describe('Export endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/cdo')
  const { getAllCdos } = require('../../../../app/repos/cdo')

  jest.mock('../../../../app/messaging/send-audit')
  const { sendExportToAudit } = require('../../../../app/messaging/send-audit')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /export route returns 200 and calls exportData', async () => {
    const options = {
      method: 'GET',
      url: '/export'
    }

    getAllCdos.mockResolvedValue([])
    sendExportToAudit.mockResolvedValue()

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
    expect(getAllCdos).toHaveBeenCalled()
  })

  afterEach(async () => {
    await server.stop()
  })
})
