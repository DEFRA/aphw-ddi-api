const { getStatuses, getDogByIndexNumber } = require('./dogs')
const { updateSearchIndexDog } = require('./search')
const { sendUpdateToAudit } = require('../messaging/send-audit')
const { DOG } = require('../constants/event/audit-event-object-types')

const updateStatusOnly = async (dog, newStatus, transaction) => {
  const statuses = await getStatuses()

  dog.status_id = statuses.filter(x => x.status === newStatus)[0].id

  await dog.save({ transaction })

  const refreshedDog = await getDogByIndexNumber(dog.index_number, transaction)

  refreshedDog.dogId = refreshedDog.id
  refreshedDog.status = newStatus

  await updateSearchIndexDog(refreshedDog, transaction)

  await sendUpdateToAudit(
    DOG,
    { index_number: refreshedDog.index_number, status: dog.status?.status },
    { index_number: refreshedDog.index_number, status: newStatus },
    'overnight-job-system-user'
  )
}

module.exports = {
  updateStatusOnly
}
