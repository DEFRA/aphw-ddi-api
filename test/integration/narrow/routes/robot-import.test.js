const { mockValidate, mockValidateEnforcement, mockValidateStandard } = require('../../../mocks/auth')
const { portalHeader, enforcementHeader, portalStandardHeader } = require('../../../mocks/jwt')

describe('Robot import endpoint', () => {
  jest.mock('../../../../app/storage')
  const { downloadBlob } = require('../../../../app/storage')

  jest.mock('../../../../app/import/robot')
  const { importRegister, processRegister } = require('../../../../app/import/robot')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')

  const createServer = require('../../../../app/server')
  let server

  beforeEach(async () => {
    jest.clearAllMocks()
    validate.mockResolvedValue(mockValidate)
    server = await createServer()
    await server.initialize()
  })

  test('POST /robot-import returns 400 when payload not JSON', async () => {
    const options = {
      method: 'POST',
      url: '/robot-import',
      headers: {
        'content-type': 'text/plain'
      },
      ...portalHeader
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
      },
      ...portalHeader
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
      },
      ...portalHeader
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
      },
      ...portalHeader
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('should return 403 given call from enforcement', async () => {
    validate.mockResolvedValue(mockValidateEnforcement)

    const options = {
      method: 'POST',
      url: '/robot-import',
      headers: {
        'content-type': 'application/json'
      },
      payload: {
        filename: 'register.xlsx',
        stage: 'saveToDB'
      },
      ...enforcementHeader
    }
    const response = await server.inject(options)
    expect(response.statusCode).toBe(403)
  })

  test('should return 403 given call from standard user', async () => {
    validate.mockResolvedValue(mockValidateStandard)

    const options = {
      method: 'POST',
      url: '/robot-import',
      headers: {
        'content-type': 'application/json'
      },
      payload: {
        filename: 'register.xlsx',
        stage: 'saveToDB'
      },
      ...portalStandardHeader
    }
    const response = await server.inject(options)
    expect(response.statusCode).toBe(403)
  })

  afterEach(async () => {
    await server.stop()
  })
})
