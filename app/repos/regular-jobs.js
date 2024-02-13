const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { autoUpdateStatuses } = require('../overnight/auto-update-statuses')

const runOvernightJobs = async () => {
  const jobId = await tryStartJob()

  if (jobId) {
    const result = await autoUpdateStatuses()
    await endJob(jobId, result)
    return result
  }

  return 'Job for today already running or run'
}

const tryStartJob = async (trans) => {
  if (!trans) {
    return sequelize.transaction(async (t) => tryStartJob(t))
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
    }
    console.log('Job for today already running or run')
  } catch (e) {
    console.log(`Error starting overnight job: ${e}`)
    throw new Error(`Error starting overnight job: ${e} ${e.stack}`)
  }
  return jobId
}

const endJob = async (jobId, resultText, trans) => {
  if (!trans) {
    return sequelize.transaction(async (t) => endJob(jobId, resultText, t))
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
  tryStartJob,
  endJob
}
