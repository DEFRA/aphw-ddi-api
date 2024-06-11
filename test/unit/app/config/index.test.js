describe('index config', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV } // Make a copy
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  test('should fail validation if invalid', () => {
    process.env.OS_PLACES_API_KEY = ''
    expect(() => require('../../../../app/config/index.js')).toThrow('The server config is invalid. "osPlacesApi.token" is not allowed to be empty')
  })
})
