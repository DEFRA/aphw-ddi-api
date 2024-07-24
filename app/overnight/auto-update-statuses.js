const sequelize = require('../config/db')
const { setExpiredCdosToFailed } = require('./expired-cdo')
const { setExpiredInsuranceToBreach } = require('./expired-insurance')
const { setExpiredNeuteringDeadlineToInBreach } = require('./expired-neutering-deadline')
const { overnightJobUser: user } = require('../constants/auth')

const autoUpdateStatuses = async () => {
  let result = ''

  try {
    const today = new Date()
    const juneDeadline = new Date('2024-07-27')

    await sequelize.transaction(async (t) => {
      result = result + await setExpiredCdosToFailed(today, user, t) + ' | '
      result = result + await setExpiredInsuranceToBreach(today, user, t) + ' | '
      result = result + await setExpiredNeuteringDeadlineToInBreach(juneDeadline, user, t)
    })
  } catch (e) {
    console.log('Error auto-updating statuses:', e)
    result = `Error auto-updating statuses: ${e} ${result}`
  }
  return result
}

module.exports = {
  autoUpdateStatuses
}
