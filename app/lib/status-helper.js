const { inactiveSubStatuses, statuses } = require('../constants/statuses')

const getInactiveSubStatus = (dog) => {
  if (dog.status.status === statuses.Inactive) {
    if (dog.death_date) {
      return inactiveSubStatuses.Dead
    } else if (dog.exported_date) {
      return inactiveSubStatuses.Exported
    } else if (dog.stolen_date) {
      return inactiveSubStatuses.Stolen
    } else if (dog.untraceable_date) {
      return inactiveSubStatuses.Untraceable
    }
  }
  return null
}

module.exports = {
  getInactiveSubStatus
}
