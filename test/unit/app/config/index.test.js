describe('index config', () => {
  jest.mock('../../../../app/lib/environment-helpers')
  const { getEnvironmentVariable } = require('../../../../app/lib/environment-helpers')
  getEnvironmentVariable.mockReturnValue('abc')

  beforeEach(() => {
    jest.resetAllMocks() // Most important - it clears the cache
  })

  test('should fail validation if invalid', () => {
    getEnvironmentVariable.mockImplementation(envVar => {
      if (envVar === 'OS_PLACES_API_KEY') {
        return ''
      }
      return undefined
    })
    expect(() => require('../../../../app/config/index.js')).toThrow('The server config is invalid. "osPlacesApi.token" is not allowed to be empty')
  })

  test('should use PARANOID_RETENTION_PERIOD given set', () => {
    getEnvironmentVariable.mockImplementation((envVar) => {
      if (envVar === 'PARANOID_RETENTION_PERIOD') {
        return '30'
      }
      return 'test'
    })
    expect(require('../../../../app/config/index.js').paranoidRetentionPeriod).toBe(30)
  })
})
