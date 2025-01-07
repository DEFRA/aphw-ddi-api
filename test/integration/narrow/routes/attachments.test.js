const { mockValidate } = require('../../../mocks/auth')
const { portalHeader } = require('../../../mocks/jwt')

const mockValidPayload = {
  fileInfo: {
    filename: 'filename1.pdf'
  },
  fieldData: {
    ddi_index_number: 'ED123456'
  }
}

const mockInvalidPayload = {
  fileInfo: {}
}

describe('Attachments endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/proxy/documents')
  const { populateTemplate } = require('../../../../app/proxy/documents')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')

  beforeEach(async () => {
    jest.clearAllMocks()
    validate.mockResolvedValue(mockValidate)
    server = await createServer()
    await server.initialize()
  })

  describe('POST /attachments/test', () => {
    test('route returns 200', async () => {
      const options = {
        method: 'POST',
        url: '/attachments/test',
        payload: mockValidPayload,
        ...portalHeader
      }
      populateTemplate.mockResolvedValue()

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.result).toEqual({ status: 'ok', message: 'output generated' })
    })

    test('route returns 400 if invalid payload', async () => {
      const options = {
        method: 'POST',
        url: '/attachments/test',
        payload: mockInvalidPayload,
        ...portalHeader
      }
      populateTemplate.mockResolvedValue()

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
      expect(response.result).toEqual({ errors: ['"fileInfo.filename" is required'] })
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
