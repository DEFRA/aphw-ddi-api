const { getEnvironmentVariable } = require('../../../../app/lib/environment-helpers')
describe('index config', () => {
  const environmentHelperStubs = require('../../../../app/lib/environment-helpers')
  const getEnvironmentVariableMock = jest.spyOn(environmentHelperStubs, 'getEnvironmentVariable')

  beforeEach(() => {
    jest.resetAllMocks() // Most important - it clears the cache
  })

  test('should fail validation if invalid', () => {
    getEnvironmentVariableMock.mockImplementation(envVar => {
      if (envVar === 'OS_PLACES_API_KEY') {
        return ''
      }
      return getEnvironmentVariable(envVar)
    })
    expect(() => require('../../../../app/config/index.js')).toThrow('The server config is invalid. "osPlacesApi.token" is not allowed to be empty')
  })

  test('should use PARANOID_RETENTION_PERIOD given set', () => {
    getEnvironmentVariableMock.mockImplementation((envVar) => {
      if (envVar === 'PARANOID_RETENTION_PERIOD') {
        return '30'
      }
      return getEnvironmentVariable(envVar)
    })
    expect(require('../../../../app/config/index.js').paranoidRetentionPeriod).toBe(30)
  })
})
