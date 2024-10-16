const { mockValidate } = require('../../../mocks/auth')
const { portalHeader } = require('../../../mocks/jwt')

describe('SearchBasic endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/dto/auditing/view')
  const { auditSearch } = require('../../../../app/dto/auditing/view')

  jest.mock('../../../../app/search/search')
  const { search } = require('../../../../app/search/search')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')
  validate.mockResolvedValue(mockValidate)

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /search route returns 200', async () => {
    search.mockResolvedValue({ results: [], totalFound: 0 })

    const options = {
      method: 'GET',
      url: '/search/dog/term',
      ...portalHeader
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(auditSearch).toHaveBeenCalledWith('term', {
      username: 'dev-user@test.com',
      displayname: 'dev-user@test.com',
      origin: 'aphw-ddi-portal'
    })
  })

  test('GET /search route returns 200', async () => {
    search.mockResolvedValue({ results: [], totalFound: 0 })

    const options = {
      method: 'GET',
      url: '/search/dog/term',
      ...portalHeader
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /search route returns error', async () => {
    search.mockImplementation(() => { throw new Error('dummy error') })

    const options = {
      method: 'GET',
      url: '/search/dog/term',
      ...portalHeader
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(500)
  })

  test('GET /search route returns 400 when bad response result', async () => {
    search.mockResolvedValue([{ searchTypeBad: 'dog' }])

    const options = {
      method: 'GET',
      url: '/search/dog/term',
      ...portalHeader
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(400)
  })

  afterEach(async () => {
    await server.stop()
  })
})
