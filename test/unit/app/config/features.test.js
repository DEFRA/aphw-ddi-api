describe('features config', () => {
  afterEach(() => {
    jest.resetModules()
  })

  test('should use FEATURE_FLAG_PURGE_DELETE given set', () => {
    jest.mock('../../../../app/lib/environment-helpers')
    const { getEnvironmentVariable } = require('../../../../app/lib/environment-helpers')
    getEnvironmentVariable.mockImplementation(key => {
      if (key === 'FEATURE_FLAG_PURGE_DELETE') {
        return 'true'
      }
      return undefined
    })
    const { runPurgeDelete } = require('../../../../app/config/features.js')
    expect(runPurgeDelete).toBe(true)
  })

  test('should not use FEATURE_FLAG_PURGE_DELETE given set to false', () => {
    jest.mock('../../../../app/lib/environment-helpers')
    const { getEnvironmentVariable } = require('../../../../app/lib/environment-helpers')
    getEnvironmentVariable.mockImplementation(key => {
      if (key === 'FEATURE_FLAG_PURGE_DELETE') {
        return 'false'
      }
      return undefined
    })
    const { runPurgeDelete } = require('../../../../app/config/features.js')
    expect(runPurgeDelete).toBe(false)
  })
  test('should not use FEATURE_FLAG_PURGE_DELETE given set to false', () => {
    jest.mock('../../../../app/lib/environment-helpers')
    const { getEnvironmentVariable } = require('../../../../app/lib/environment-helpers')
    getEnvironmentVariable.mockReturnValue(undefined)

    const { runPurgeDelete } = require('../../../../app/config/features.js')
    expect(runPurgeDelete).toBe(false)
  })

  test('should not use FEATURE_FLAG_PURGE_DELETE given invalid env variable', () => {
    jest.mock('../../../../app/lib/environment-helpers')
    const { getEnvironmentVariable } = require('../../../../app/lib/environment-helpers')
    getEnvironmentVariable.mockReturnValue('not a boolean')

    expect(() => require('../../../../app/config/features.js')).toThrow('The server config is invalid. "runPurgeDelete" must be a boolean')
  })
})
