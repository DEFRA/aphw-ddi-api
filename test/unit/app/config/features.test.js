describe('features config', () => {
  afterEach(() => {
    jest.resetModules()
  })

  test('should use FEATURE_FLAG_EXAMPLE given set', () => {
    jest.mock('../../../../app/lib/environment-helpers')
    const { getEnvironmentVariable } = require('../../../../app/lib/environment-helpers')
    getEnvironmentVariable.mockImplementation(key => {
      if (key === 'FEATURE_FLAG_EXAMPLE') {
        return 'true'
      }
      return undefined
    })
    const { example } = require('../../../../app/config/featureFlags.js')
    expect(example).toBe(true)
  })

  test('should not use FEATURE_FLAG_EXAMPLE given set to false', () => {
    jest.mock('../../../../app/lib/environment-helpers')
    const { getEnvironmentVariable } = require('../../../../app/lib/environment-helpers')
    getEnvironmentVariable.mockImplementation(key => {
      if (key === 'FEATURE_FLAG_EXAMPLE') {
        return 'false'
      }
      return undefined
    })
    const { example } = require('../../../../app/config/featureFlags.js')
    expect(example).toBe(false)
  })
  test('should not use FEATURE_FLAG_EXAMPLE given set to false', () => {
    jest.mock('../../../../app/lib/environment-helpers')
    const { getEnvironmentVariable } = require('../../../../app/lib/environment-helpers')
    getEnvironmentVariable.mockReturnValue(undefined)

    const { example } = require('../../../../app/config/featureFlags.js')
    expect(example).toBe(false)
  })

  test('should not use FEATURE_FLAG_EXAMPLE given invalid env variable', () => {
    jest.mock('../../../../app/lib/environment-helpers')
    const { getEnvironmentVariable } = require('../../../../app/lib/environment-helpers')
    getEnvironmentVariable.mockReturnValue('not a boolean')

    expect(() => require('../../../../app/config/featureFlags.js')).toThrow('The server config is invalid. "example" must be a boolean')
  })
})
