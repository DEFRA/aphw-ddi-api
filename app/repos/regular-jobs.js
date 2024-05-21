const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { limitStringLength, removeFromStartOfString } = require('../lib/string-helpers')

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
      const newResultText = `${currentJob.result ?? ''} ${resultText}`
      currentJob.result = removeFromStartOfString(limitStringLength(newResultText, 1000), 'Running ')
      await currentJob.save({ transaction: trans })
    } else {
      throw new Error(`Overnight jobId ${jobId} not found`)
    }
  } catch (e) {
    console.log(`Error finishing overnight job: ${jobId} ${e}`)
    throw new Error(`Error finishing overnight job: ${jobId} ${e} ${e.stack}`)
  }
}

const createNewJob = async () => {
  const newJob = await sequelize.models.regular_job.create({
    run_date: new Date(),
    start_time: new Date(),
    result: 'Running'
  })

  return newJob
}

const updateRunningJobProgress = async (jobId, progressText) => {
  const currentJob = await sequelize.models.regular_job.findByPk(jobId)
  if (currentJob) {
    const newText = `${currentJob.result ?? ''} ${progressText}`
    currentJob.result = limitStringLength(newText, 1000)
    await currentJob.save()
    return currentJob
  }
}

module.exports = {
  tryStartJob,
  endJob,
  getRegularJobs,
  updateRunningJobProgress,
  createNewJob
}
