describe('Robot import endpoint', () => {
  jest.mock('../../../../app/storage')
  const { downloadBlob } = require('../../../../app/storage')

  jest.mock('../../../../app/import/robot')
  const { importRegister, processRegister } = require('../../../../app/import/robot')

  const createServer = require('../../../../app/server')
  let server

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('POST /robot-import returns 400 when payload not JSON', async () => {
    const options = {
      method: 'POST',
      url: '/robot-import',
      headers: {
        'content-type': 'text/plain'
      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(400)
  })

  test('POST /robot-import returns 400 when errors during import', async () => {
    downloadBlob.mockResolvedValue([])

    importRegister.mockResolvedValue({
      add: [],
      errors: [
        'Error 1'
      ]
    })

    const options = {
      method: 'POST',
      url: '/robot-import',
      headers: {
        'content-type': 'application/json'
      },
      payload: {
        filename: 'register.xlsx'
      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(400)
  })

  test('POST /robot-import returns 200 when validating', async () => {
    downloadBlob.mockResolvedValue([])

    importRegister.mockResolvedValue({
      add: []
    })

    processRegister.mockResolvedValue()

    const options = {
      method: 'POST',
      url: '/robot-import',
      headers: {
        'content-type': 'application/json'
      },
      payload: {
        filename: 'register.xlsx',
        stage: 'spreadsheet-validation'
      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('POST /robot-import returns 200', async () => {
    downloadBlob.mockResolvedValue([])

    importRegister.mockResolvedValue({
      add: []
    })

    processRegister.mockResolvedValue()

    const options = {
      method: 'POST',
      url: '/robot-import',
      headers: {
        'content-type': 'application/json'
      },
      payload: {
        filename: 'register.xlsx',
        stage: 'saveToDB'
      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
