const sequelize = require('../config/db')
const { setExpiredCdosToFailed } = require('./expired-cdo')
const { setExpiredInsuranceToBreach } = require('./expired-insurance')
const { setExpiredNeuteringDeadlineToInBreach } = require('./expired-neutering-deadline')
const { getEnvironmentVariableOrString } = require('../lib/environment-helpers')

const autoUpdateStatuses = async () => {
  let result = ''

  const user = {
    username: 'overnight-job-system-user',
    displayname: 'Overnight Job System User'
  }

  try {
    const today = new Date()
    let todayNeuteuring = new Date()

    if (
      getEnvironmentVariableOrString('EVENTS_TOPIC_ADDRESS').endsWith('-snd') ||
      getEnvironmentVariableOrString('EVENTS_TOPIC_ADDRESS').endsWith('-dev')
    ) {
      todayNeuteuring = new Date('2024-07-27')
    }

    await sequelize.transaction(async (t) => {
      result = result + await setExpiredCdosToFailed(today, user, t) + ' | '
      result = result + await setExpiredInsuranceToBreach(today, user, t) + ' | '
      result = result + await setExpiredNeuteringDeadlineToInBreach(todayNeuteuring, user, t)
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
