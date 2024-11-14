const sequelize = require('../config/db')
const { hasJobRunBefore } = require('../repos/regular-jobs')
const { setExpiredCdosToFailed } = require('./expired-cdo')
const { setExpiredInsuranceToBreach, addBreachReasonToExpiredInsurance } = require('./expired-insurance')
const { revertExpiredInsurance } = require('./revert-expired-insurance')
const { setExpiredNeuteringDeadlineToInBreach, addBreachReasonToExpiredNeuteringDeadline } = require('./expired-neutering-deadline')
const { setExpiredMicrochipDeadlineToInBreach, addBreachReasonToExpiredMicrochipDeadline } = require('./expired-microchip-deadline')
const { overnightJobUser: user } = require('../constants/auth')

const autoUpdateStatuses = async () => {
  let result = ''

  try {
    const today = new Date()

    const insuranceRevertAlreadyRun = await hasJobRunBefore('Success Revert In-breach Insurance to Exempt')

    await sequelize.transaction(async (t) => {
      result = result + await setExpiredCdosToFailed(today, user, t) + ' | '

      if (!insuranceRevertAlreadyRun) {
        result = result + await revertExpiredInsurance(today, user, t) + ' | '
      }

      result = result + await addBreachReasonToExpiredInsurance(today, user, t) + ' | '
      result = result + await setExpiredInsuranceToBreach(today, user, t) + ' | '
      result = result + await addBreachReasonToExpiredNeuteringDeadline(today, user, t) + ' | '
      result = result + await setExpiredNeuteringDeadlineToInBreach(today, user, t) + ' | '
      result = result + await addBreachReasonToExpiredMicrochipDeadline(today, user, t) + ' | '
      result = result + await setExpiredMicrochipDeadlineToInBreach(today, user, t)
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
