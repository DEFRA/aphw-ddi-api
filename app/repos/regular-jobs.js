const sequelize = require('../config/db')

const updateOvernightStatuses = async () => {
  try {
    const today = new Date(new Date().toDateString())
    console.log('today', today)
    await sequelize.transaction(async (t) => {
      const currentJob = await sequelize.models.regular_job.findOne({
        where: {
          run_date: {
            [sequelize.Op.gte]: today
          }
        }
      })
      console.log('current', currentJob)
    })
  } catch (e) {
    console.log(`Error starting overnight job: ${e}`)
    throw e
  }
}

module.exports = {
  updateOvernightStatuses
}
