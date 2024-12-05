const { getEnvironmentVariable, getEnvironmentVariableOrString, getEnvCode } = require('../../../../app/lib/environment-helpers')
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

    test('should return undefined given env variable does not exist', () => {
      const customEnvVariable = getEnvironmentVariable('CUSTOM_ENV_VARIABLE')
      expect(customEnvVariable).toBe(undefined)
    })
  })

  describe('getEnvironmentVariableOrString', () => {
    test('should get env variable if it exists', () => {
      process.env.CUSTOM_ENV_VARIABLE2 = 'abc'
      const customEnvVariable = getEnvironmentVariableOrString('CUSTOM_ENV_VARIABLE2')
      expect(customEnvVariable).toBe('abc')
    })

    test('should return empty string given env variable does not exist', () => {
      process.env.CUSTOM_ENV_VARIABLE2 = undefined
      const customEnvVariable = getEnvironmentVariableOrString('CUSTOM_ENV_VARIABLE2')
      expect(customEnvVariable).toBe('')
    })

    test('should return empty string given env variable is 0', () => {
      process.env.CUSTOM_ENV_VARIABLE2 = '0'
      const customEnvVariable = getEnvironmentVariableOrString('CUSTOM_ENV_VARIABLE2')
      expect(customEnvVariable).toBe('0')
    })
  })

  describe('getEnvCode', () => {
    test('should return blank string if no config', () => {
      expect(getEnvCode(undefined)).toBe('')
      expect(getEnvCode(null)).toBe('')
      expect(getEnvCode({})).toBe('')
    })

    test('should return blank string if config has wrong number of segments', () => {
      expect(getEnvCode('aphw-ddi-api')).toBe('')
      expect(getEnvCode('aphw-ddi-api-test-abc')).toBe('')
      expect(getEnvCode('')).toBe('')
    })

    test('should return 4th element if config is correct', () => {
      expect(getEnvCode('aphw-ddi-api-dev')).toBe('dev')
      expect(getEnvCode('aphw-ddi-api-test')).toBe('test')
      expect(getEnvCode('aphw-ddi-api-pre')).toBe('pre')
      expect(getEnvCode('aphw-ddi-api-prd')).toBe('prd')
    })
  })
})
