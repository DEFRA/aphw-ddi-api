const config = require('../config')
const { autoUpdateStatuses } = require('./auto-update-statuses')
const { createExportFile } = require('./create-export-file')
const { tryStartJob, endJob, createNewJob } = require('../repos/regular-jobs')
const { purgeSoftDeletedRecords } = require('./purge-soft-deleted-records')
const { createBearerHeader } = require('../auth/jwt-utils')
const { issuers } = require('../constants/auth')
const { overnightJobUser: user } = require('../constants/auth')

const triggerExportGeneration = server => {
  server.inject({
    method: 'GET',
    url: `/export-create-file?batchSize=${config.overnightExportBatchSize ?? 2000}`,
    headers: createBearerHeader(issuers.api)(user)
  })
}

const runOvernightJobs = async (server) => {
  const jobId = await tryStartJob()

  if (jobId) {
    let result = await autoUpdateStatuses()
    result += ' | ' + await purgeSoftDeletedRecords()

    await endJob(jobId, result)
    triggerExportGeneration(server)
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
