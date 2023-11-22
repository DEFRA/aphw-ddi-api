jest.mock('../../../../app/import/robot-import')
const { processRobotImport } = require('../../../../app/import/robot-import')
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
    processRobotImport.mockResolvedValue({
      stats: {
        errors: [
          'Error 1'
        ],
        created: []
      }
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
    processRobotImport.mockResolvedValue({
      stats: {
        errors: [],
        created: [
          'New dog index number 1234 created',
          'Created person id 39',
          'Linked person id 39 to dog id 40'
        ]
      }
    })

    const options = {
      method: 'POST',
      url: '/robot-import',
      headers: {
        'content-type': 'application/json'
      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
