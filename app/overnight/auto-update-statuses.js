const sequelize = require('../config/db')
const { setExpiredCdosToFailed } = require('./expired-cdo')
const { setExpiredInsuranceToBreach, addBreachReasonToExpiredInsurance } = require('./expired-insurance')
const { setExpiredNeuteringDeadlineToInBreach } = require('./expired-neutering-deadline')
const { overnightJobUser: user } = require('../constants/auth')

const autoUpdateStatuses = async () => {
  let result = ''

  try {
    const today = new Date()

    await sequelize.transaction(async (t) => {
      result = result + await setExpiredCdosToFailed(today, user, t) + ' | '
      result = result + await addBreachReasonToExpiredInsurance(today, user, t) + ' | '
      result = result + await setExpiredInsuranceToBreach(today, user, t) + ' | '
      result = result + await setExpiredNeuteringDeadlineToInBreach(today, user, t)
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
