const sequelize = require('../config/db')
const { setExpiredNeuteringDeadlineToInBreach } = require('./expired-neutering-deadline')
const { setExpiredCdosToFailed } = require('./expired-cdo')
const { setExpiredInsuranceToBreach } = require('./expired-insurance')
const { setExpiredMicrochipDeadlineToInBreach } = require('./expired-microchip-deadline')

const autoUpdateStatuses = async () => {
  let result = ''

  try {
    const today = new Date()

    await sequelize.transaction(async (t) => {
      result = result + await setExpiredCdosToFailed(today, t)
      result = result + ' | ' + await setExpiredInsuranceToBreach(today, t)
      result = result + ' | ' + await setExpiredNeuteringDeadlineToInBreach(today, t)
      result = result + ' | ' + await setExpiredMicrochipDeadlineToInBreach(today, t)
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
