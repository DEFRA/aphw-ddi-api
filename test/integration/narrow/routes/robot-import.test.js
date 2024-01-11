jest.mock('../../../../app/storage')

jest.mock('../../../../app/import/robot')
const { importRegister, processRegister } = require('../../../../app/import/robot')

const { importOneDogOnePerson } = require('../app/import/robot-import-data')

describe('Robot import endpoint', () => {
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
      payload: importOneDogOnePerson
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(400)
  })

  test('POST /robot-import returns 200', async () => {
    importRegister.mockResolvedValue({
      add: [],
      errors: []
    })

    processRegister.mockResolvedValue()

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
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
