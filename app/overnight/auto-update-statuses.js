const sequelize = require('../config/db')
const { setExpiredNeuteringDeadlineToInBreach } = require('./expired-neutering-deadline')
const { setExpiredCdosToFailed } = require('./expired-cdo')
const { setExpiredInsuranceToBreach } = require('./expired-insurance')
const { setExpiredMicrochipDeadlineToInBreach } = require('./expired-microchip-deadline')

const autoUpdateStatuses = async () => {
  let result = ''

  const user = {
    username: 'overnight-job-system-user',
    displayname: 'Overnight Job System User'
  }

  try {
    const today = new Date()

    await sequelize.transaction(async (t) => {
      result = result + await setExpiredCdosToFailed(today, user, t)
      result = result + ' | ' + await setExpiredInsuranceToBreach(today, user, t)
      result = result + ' | ' + await setExpiredNeuteringDeadlineToInBreach(today, user, t)
      result = result + ' | ' + await setExpiredMicrochipDeadlineToInBreach(today, user, t)
    })
  } catch (e) {
    console.log(`Error auto-updating statuses: ${e}`)
    result = `Error auto-updating statuses: ${e} ${result}`
  }
  return result
}

module.exports = {
  autoUpdateStatuses
}
