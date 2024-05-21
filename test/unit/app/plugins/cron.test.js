const { setupCron } = require('../../../../app/plugins/cron')

const { runOvernightJobs } = require('../../../../app/overnight/run-jobs')
jest.mock('../../../../app/overnight/run-jobs')

const cron = require('node-cron')
jest.mock('node-cron')

const config = require('../../../../app/config/cron')
jest.mock('../../../../app/config/cron')

describe('Cron plugin test', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    config.overnightJobCrontab = undefined
    cron.schedule.mockImplementation((timeConfig, func) => { func() })
    runOvernightJobs.mockResolvedValue()
  })

  test('setupCron should use specific config', async () => {
    config.overnightJobCrontab = '1 2 * * *'
    setupCron()
    expect(cron.schedule).toHaveBeenCalledWith('1 2 * * *', expect.anything(), expect.anything())
    expect(runOvernightJobs).toHaveBeenCalledTimes(1)
  })

  test('setupCron should use default config', async () => {
    setupCron()
    expect(cron.schedule).toHaveBeenCalledWith('5 4 * * *', expect.anything(), expect.anything())
    expect(runOvernightJobs).toHaveBeenCalledTimes(1)
  })
})
