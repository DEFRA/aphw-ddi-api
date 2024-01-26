const { getStatuses } = require('./dogs')
const { updateSearchIndexDog } = require('./search')
const { dogDto } = require('../dto/dog')
const { sendUpdateToAudit } = require('../messaging/send-audit')
const { DOG } = require('../constants/event/audit-event-object-types')

const updateStatusOnly = async (dog, newStatus, transaction) => {
  const statuses = await getStatuses()

  dog.status_id = statuses.filter(x => x.status === newStatus)[0].id

  await dog.save({ transaction })

  const dto = dogDto(dog)
  dto.dogId = dog.id
  dto.status = newStatus

  await updateSearchIndexDog(dto, transaction)

  await sendUpdateToAudit(
    DOG,
    { index_number: dog?.index_number, status: dog?.status?.status },
    { index_number: dog?.index_number, status: newStatus },
    'overnight-job-system-user'
  )
}

module.exports = {
  updateStatusOnly
}
