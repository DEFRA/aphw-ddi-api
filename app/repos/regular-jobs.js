const sequelize = require('../config/db')
const config = require('../config/index')
const { Op } = require('sequelize')
const { autoUpdateStatuses } = require('../overnight/auto-update-statuses')
const { createExportFile } = require('../overnight/create-export-file')

const getRegularJobs = async () => {
  try {
    const jobs = await sequelize.models.regular_job.findAll({
      order: [[sequelize.col('regular_job.id'), 'DESC']]
    })

    return jobs
  } catch (e) {
    console.log(`Error retrieving regular-jobs: ${e}`)
    throw e
  }
}

const runOvernightJobs = async () => {
  const jobId = await tryStartJob()

  if (jobId) {
    let result = await autoUpdateStatuses()
    result = result + ' | ' + await createExportFile(config.overnightExportBatchSize)
    await endJob(jobId, result)
    return result
  }

  return 'Job for today already running or run'
}

const runExportNow = async (rowsPerBatch) => {
  const newJob = await sequelize.models.regular_job.create({
    run_date: new Date(),
    start_time: new Date(),
    result: 'Running'
  })

  const res = await createExportFile(rowsPerBatch)

  await endJob(newJob.id, `${res} batchSize ${rowsPerBatch}`)
}

const tryStartJob = async (trans) => {
  if (!trans) {
    return await sequelize.transaction(async (t) => tryStartJob(t))
  }

  let jobId = null

  try {
    const today = new Date()

    const currentJob = await sequelize.models.regular_job.findOne({
      where: {
        run_date: {
          [Op.gte]: today
        }
      },
      transaction: trans
    })

    if (!currentJob) {
      const newJob = await sequelize.models.regular_job.create({
        run_date: today,
        start_time: new Date(),
        result: 'Running'
      },
      {
        transaction: trans
      })

      console.log(`Job started for today - jobId: ${newJob?.id}`)
      jobId = newJob.id
    } else {
      console.log('Job for today already running or run')
    }
  } catch (e) {
    console.log(`Error starting overnight job: ${e}`)
    throw new Error(`Error starting overnight job: ${e} ${e.stack}`)
  }
  return jobId
}

const endJob = async (jobId, resultText, trans) => {
  if (!trans) {
    return await sequelize.transaction(async (t) => endJob(jobId, resultText, t))
  }

  try {
    const currentJob = await sequelize.models.regular_job.findByPk(jobId, {
      transaction: trans
    })

    if (currentJob) {
      currentJob.end_time = new Date()
      currentJob.result = resultText?.length >= 1000 ? resultText.substring(0, 999) : resultText
      await currentJob.save({ transaction: trans })
    } else {
      throw new Error(`Overnight jobId ${jobId} not found`)
    }
  } catch (e) {
    console.log(`Error finishing overnight job: ${jobId} ${e}`)
    throw new Error(`Error finishing overnight job: ${jobId} ${e} ${e.stack}`)
  }
}

module.exports = {
  runOvernightJobs,
  runExportNow,
  tryStartJob,
  endJob,
  getRegularJobs
}
