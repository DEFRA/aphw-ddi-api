const config = require('../config/index')
const { autoUpdateStatuses } = require('./auto-update-statuses')
const { createExportFile } = require('./create-export-file')
const { tryStartJob, endJob, updateRunningJobProgress, createNewJob } = require('../repos/regular-jobs')

const runOvernightJobs = async () => {
  const jobId = await tryStartJob()

  if (jobId) {
    let result = await autoUpdateStatuses()
    await updateRunningJobProgress(jobId, result)
    result = await createExportFile(config.overnightExportBatchSize, jobId)
    await endJob(jobId, result)
    return result
  }

  return 'Job for today already running or run'
}

const runExportNow = async (rowsPerBatch) => {
  const newJob = await createNewJob()

  const res = await createExportFile(rowsPerBatch, newJob.id)

  await endJob(newJob.id, res)
}

module.exports = {
  runOvernightJobs,
  runExportNow
}
