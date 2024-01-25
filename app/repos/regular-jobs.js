const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { autoUpdateStatuses } = require('../overnight/auto-update-statuses')

const updateOvernightStatuses = async () => {
  const jobId = await tryStartJob()

  if (jobId) {
    const result = await autoUpdateStatuses()
    await endJob(jobId, result)
    return result
  }

  return 'Job for today already running or run'
}

const tryStartJob = async () => {
  let jobId = null

  try {
    const today = new Date()

    console.log('tryStart 1', sequelize.transaction)
    await sequelize.transaction(async (t) => {
      console.log('tryStart 2')
      const currentJob = await sequelize.models.regular_job.findOne({
        where: {
          run_date: {
            [Op.gte]: today
          }
        },
        transaction: t
      })

      console.log('currentJob', currentJob)
      if (!currentJob) {
        const newJob = await sequelize.models.regular_job.create({
          run_date: today,
          start_time: new Date(),
          result: 'Running'
        },
        {
          transaction: t
        })
        console.log(`Job started for today - jobId: ${newJob?.id}`)
        jobId = newJob.id
      }
      console.log('Job for today already running or run')
    })
  } catch (e) {
    console.log(`Error starting overnight job: ${e}`)
    throw e
  }
  return jobId
}

const endJob = async (jobId, resultText) => {
  try {
    console.log('endJob 1')
    await sequelize.transaction(async (t) => {
      console.log('endJob 2')
      const currentJob = await sequelize.models.regular_job.findByPk(jobId, {
        transaction: t
      })

      console.log('endJob 3')
      if (currentJob) {
        currentJob.end_time = new Date()
        currentJob.result = resultText?.length >= 1000 ? resultText.substring(0, 999) : resultText
        await currentJob.save({ transaction: t })
      } else {
        throw new Error(`Overnight jobId ${jobId} not found`)
      }
    })
  } catch (e) {
    console.log(`Error finishing overnight job: ${e}`)
    throw e
  }
}

module.exports = {
  updateOvernightStatuses,
  tryStartJob,
  endJob
}
