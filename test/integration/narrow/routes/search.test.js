const { mockValidate } = require('../../../mocks/auth')
const { portalHeader } = require('../../../mocks/jwt')
const { devUser } = require('../../../mocks/auth')

describe('SearchBasic endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/dto/auditing/view')
  const { auditSearch } = require('../../../../app/dto/auditing/view')

  jest.mock('../../../../app/search/search-processors/search-results-paginator')
  const { getPageFromCache, saveResultsToCacheAndGetPageOne } = require('../../../../app/search/search-processors/search-results-paginator')

  jest.mock('../../../../app/search/search')
  const { search } = require('../../../../app/search/search')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')
  validate.mockResolvedValue(mockValidate)

  jest.mock('../../../../app/auth/get-user')
  const { getCallingUser } = require('../../../../app/auth/get-user')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /search route returns 200', async () => {
    getPageFromCache.mockResolvedValue({ results: [], totalFound: 0 })
    search.mockResolvedValue({ results: [], totalFound: 0 })
    getCallingUser.mockReturnValue(devUser)

    const options = {
      method: 'GET',
      url: '/search/dog/term',
      ...portalHeader
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(auditSearch).toHaveBeenCalledWith('term', {}, {
      username: 'dev-user@test.com',
      displayname: 'Dev User'
    })
  })

  test('GET /search route returns 200 with national search', async () => {
    getPageFromCache.mockResolvedValue({ results: [], totalFound: 0 })
    search.mockResolvedValue({ results: [], totalFound: 0 })
    getCallingUser.mockReturnValue(devUser)

    const options = {
      method: 'GET',
      url: '/search/dog/term?national=true',
      ...portalHeader
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(auditSearch).toHaveBeenCalledWith('term', { national: 'true' }, {
      username: 'dev-user@test.com',
      displayname: 'Dev User'
    })
  })

  test('GET /search route returns 200', async () => {
    getPageFromCache.mockResolvedValue({ results: [], totalFound: 0 })
    search.mockResolvedValue({ results: [], totalFound: 0 })
    getCallingUser.mockReturnValue(devUser)

    const options = {
      method: 'GET',
      url: '/search/dog/term',
      ...portalHeader
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /search route returns error', async () => {
    getPageFromCache.mockImplementation(() => { throw new Error('dummy error') })
    search.mockResolvedValue({ results: [], totalFound: 0 })
    getCallingUser.mockReturnValue(devUser)

    const options = {
      method: 'GET',
      url: '/search/dog/term?page=2',
      ...portalHeader
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(500)
  })

  test('GET /search route returns 400 when bad response result', async () => {
    getPageFromCache.mockResolvedValue({ success: true, invalidKey: 123 })
    saveResultsToCacheAndGetPageOne.mockResolvedValue({ success: true })
    search.mockResolvedValue({ results: [], totalFound: 0 })
    getCallingUser.mockReturnValue(devUser)
    const options = {
      method: 'GET',
      url: '/search/dog/term?page=2',
      ...portalHeader
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(400)
  })

  test('GET /search route returns 200 when cached page returned', async () => {
    getPageFromCache.mockResolvedValue({ success: true })
    saveResultsToCacheAndGetPageOne.mockResolvedValue()
    search.mockResolvedValue({ results: [], totalFound: 0 })
    getCallingUser.mockReturnValue(devUser)
    const options = {
      method: 'GET',
      url: '/search/dog/term?page=2',
      ...portalHeader
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /search route returns 200 when page not in cache', async () => {
    getPageFromCache.mockResolvedValue({ success: false })
    saveResultsToCacheAndGetPageOne.mockResolvedValue()
    search.mockResolvedValue({ results: [], totalFound: 0 })
    getCallingUser.mockReturnValue(devUser)
    const options = {
      method: 'GET',
      url: '/search/dog/term?page=2',
      ...portalHeader
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
