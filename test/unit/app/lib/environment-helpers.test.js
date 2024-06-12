const { getEnvironmentVariable } = require('../../../../app/lib/environment-helpers')
describe('environment-helpers', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV } // Make a copy
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  describe('getEnvironmentVariable', () => {
    test('should get env variable if it exists', () => {
      process.env.CUSTOM_ENV_VARIABLE = 'abc'
      const customEnvVariable = getEnvironmentVariable('CUSTOM_ENV_VARIABLE')
      expect(customEnvVariable).toBe('abc')
    })

    test('should return undefined if it does not exist', () => {
      const customEnvVariable = getEnvironmentVariable('CUSTOM_ENV_VARIABLE')
      expect(customEnvVariable).toBe(undefined)
    })
  })
})
