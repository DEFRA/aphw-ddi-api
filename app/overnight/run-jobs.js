const wreck = require('@hapi/wreck')
const config = require('../config/index')
const { autoUpdateStatuses } = require('./auto-update-statuses')
const { createExportFile } = require('./create-export-file')
const { tryStartJob, endJob, createNewJob } = require('../repos/regular-jobs')

const triggerExportGeneration = () => {
  // Don't 'await' as 'send and forget' call
  wreck.get(`/export-create-file?batchSize=${config.overnightExportBatchSize}`)
}

const runOvernightJobs = async () => {
  const jobId = await tryStartJob()

  if (jobId) {
    const result = await autoUpdateStatuses()
    await endJob(jobId, result)
    triggerExportGeneration()
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
  runExportNow,
  triggerExportGeneration
}
