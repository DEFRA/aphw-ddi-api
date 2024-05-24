const { runOvernightJobs, runExportNow } = require('../../../../app/overnight/run-jobs')

const { autoUpdateStatuses } = require('../../../../app/overnight/auto-update-statuses')
jest.mock('../../../../app/overnight/auto-update-statuses')

const { createExportFile } = require('../../../../app/overnight//create-export-file')
jest.mock('../../../../app/overnight/create-export-file')

const { updateRunningJobProgress, tryStartJob, endJob, createNewJob } = require('../../../../app/repos/regular-jobs')
jest.mock('../../../../app/repos/regular-jobs')

jest.mock('@hapi/wreck')
const wreck = require('@hapi/wreck')

let server

describe('RunJobs test', () => {
  beforeEach(async () => {
    wreck.get.mockResolvedValue()
    server = { inject: jest.fn() }
    jest.clearAllMocks()
  })

  test('runOvernightJobs should call jobs', async () => {
    updateRunningJobProgress.mockResolvedValue()
    tryStartJob.mockResolvedValue(123)
    endJob.mockResolvedValue()
    autoUpdateStatuses.mockResolvedValue('ok - insurance 2 rows')
    const res = await runOvernightJobs(server)
    expect(res).toBe('ok - insurance 2 rows')
    expect(autoUpdateStatuses).toHaveBeenCalledTimes(1)
  })

  test('runExportNow should call createExportFile', async () => {
    createNewJob.mockResolvedValue({ id: 123 })
    endJob.mockResolvedValue()
    createExportFile.mockResolvedValue()
    await runExportNow(100)
    expect(createExportFile).toHaveBeenCalledTimes(1)
  })
})