const { jobs: mockJobs } = require('../../../mocks/jobs')
const { mockValidate, mockValidateEnforcement, mockValidateStandard } = require('../../../mocks/auth')
const { portalHeader, enforcementHeader, portalStandardHeader } = require('../../../mocks/jwt')

describe('Regular jobs endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/regular-jobs')
  const { getRegularJobs } = require('../../../../app/repos/regular-jobs')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')

  jest.mock('../../../../app/lib/email-helper')
  const { emailApplicationPack } = require('../../../../app/lib/email-helper')

  beforeEach(async () => {
    jest.clearAllMocks()
    validate.mockResolvedValue(mockValidate)
    emailApplicationPack.mockResolvedValue()
    server = await createServer()
    await server.initialize()
  })

  test('GET /regular-jobs route returns 200', async () => {
    getRegularJobs.mockResolvedValue(mockJobs)

    const options = {
      method: 'GET',
      url: '/regular-jobs',
      ...portalHeader
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('should return 403 given call from enforcement', async () => {
    validate.mockResolvedValue(mockValidateEnforcement)

    const options = {
      method: 'GET',
      url: '/regular-jobs',
      ...enforcementHeader
    }
    const response = await server.inject(options)
    expect(response.statusCode).toBe(403)
  })

  test('should return 403 given call from standard user', async () => {
    validate.mockResolvedValue(mockValidateStandard)

    const options = {
      method: 'GET',
      url: '/regular-jobs',
      ...portalStandardHeader
    }
    const response = await server.inject(options)
    expect(response.statusCode).toBe(403)
  })

  test('GET /regular-jobs route returns 500 if db error', async () => {
    getRegularJobs.mockRejectedValue(new Error('Test error'))

    const options = {
      method: 'GET',
      url: '/regular-jobs',
      ...portalHeader
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(500)
  })

  afterEach(async () => {
    await server.stop()
  })
})
