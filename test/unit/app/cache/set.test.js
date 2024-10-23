jest.mock('../../../../app/cache/get-cache')
const getCache = require('../../../../app/cache/get-cache')

jest.mock('../../../../app/cache/set-cache-value')
const setCacheValue = require('../../../../app/cache/set-cache-value')

const { set } = require('../../../../app/cache')
const { requestWithCache } = require('../../../mocks/request')

const key = 'Key'
const value = 'Value'

let request

beforeEach(async () => {
  request = requestWithCache

  getCache.mockReturnValue(request.server.app.cache)
  setCacheValue.mockResolvedValue(undefined)
})

afterEach(async () => {
  jest.resetAllMocks()
})

describe('set cache', () => {
  test('should call getCache', async () => {
    await set(request, key, value)
    expect(getCache).toHaveBeenCalled()
  })

  test('should call getCache once', async () => {
    await set(request, key, value)
    expect(getCache).toHaveBeenCalledTimes(1)
  })

  test('should call getCache with request', async () => {
    await set(request, key, value)
    expect(getCache).toHaveBeenCalledWith(request)
  })

  test('should call setCacheValue', async () => {
    await set(request, key, value)
    expect(setCacheValue).toHaveBeenCalled()
  })

  test('should call setCacheValue once', async () => {
    await set(request, key, value)
    expect(setCacheValue).toHaveBeenCalledTimes(1)
  })

  test('should call setCacheValue with getCache, key and value', async () => {
    await set(request, key, value)
    expect(setCacheValue).toHaveBeenCalledWith(getCache(), key, value, undefined)
  })

  test('should call setCacheValue with getCache, key, value and ttl', async () => {
    const ttl = new Date()
    ttl.setTime(ttl.getTime() + (1000 * 60 * 60))
    await set(request, key, value, ttl)
    expect(setCacheValue).toHaveBeenCalledWith(getCache(), key, value, ttl)
  })

  test('should return undefined', async () => {
    const result = await set(request, key, value)
    expect(result).toBeUndefined()
  })

  test('should throw when getCache throws', async () => {
    getCache.mockImplementation(() => { throw new Error('Redis retreival error') })

    const wrapper = async () => {
      await set(request, key, value)
    }

    await expect(wrapper).rejects.toThrowError()
  })

  test('should throw Error when getCache throws Error', async () => {
    getCache.mockImplementation(() => { throw new Error('Redis retreival error') })

    const wrapper = async () => {
      await set(request, key, value)
    }

    await expect(wrapper).rejects.toThrowError(Error)
  })

  test('should throw "Redis retreival error" error when getCache throws "Redis retreival error" error', async () => {
    getCache.mockImplementation(() => { throw new Error('Redis retreival error') })

    const wrapper = async () => {
      await set(request, key, value)
    }

    expect(wrapper).rejects.toThrowError(/^Redis retreival error$/)
  })

  test('should throw when setCacheValue throws', async () => {
    setCacheValue.mockRejectedValue(new Error('Redis write error'))

    const wrapper = async () => {
      await set(request, key, value)
    }

    expect(wrapper).rejects.toThrowError()
  })

  test('should throw Error when setCacheValue throws Error', async () => {
    setCacheValue.mockRejectedValue(new Error('Redis write error'))

    const wrapper = async () => {
      await set(request, key, value)
    }

    expect(wrapper).rejects.toThrowError(Error)
  })

  test('should throw "Redis write error" error when setCacheValue throws "Redis write error" error', async () => {
    setCacheValue.mockRejectedValue(new Error('Redis write error'))

    const wrapper = async () => {
      await set(request, key, value)
    }

    expect(wrapper).rejects.toThrowError(/^Redis write error$/)
  })
})
