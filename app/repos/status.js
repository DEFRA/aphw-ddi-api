const { getDogByIndexNumber, updateBreaches, getCachedStatuses } = require('./dogs')
const { updateSearchIndexDog } = require('./search-index')
const { sendUpdateToAudit } = require('../messaging/send-audit')
const { DOG } = require('../constants/event/audit-event-object-types')

const updateStatusOnly = async (dog, newStatus, user, transaction) => {
  const statuses = await getCachedStatuses()
  const prevStatus = dog.status?.status

  dog.status_id = statuses.filter(x => x.status === newStatus)[0].id
  await updateBreaches(dog, statuses, transaction)
  await dog.save({ transaction })

  const refreshedDog = await getDogByIndexNumber(dog.index_number, transaction)
  await updateSearchIndexDog(refreshedDog, transaction)
  await sendUpdateToAudit(
    DOG,
    { index_number: refreshedDog.index_number, status: prevStatus },
    { index_number: refreshedDog.index_number, status: newStatus },
    user
  )
}

module.exports = {
  updateStatusOnly
}
