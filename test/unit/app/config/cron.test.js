describe('cron config', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV } // Make a copy
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  test('should fail validation if invalid', () => {
    process.env.OVERNIGHT_JOB_CRONTAB = ''
    expect(() => require('../../../../app/config/cron.js')).toThrow('The crontab config is invalid. "overnightJobCrontab" is not allowed to be empty')
  })
})
