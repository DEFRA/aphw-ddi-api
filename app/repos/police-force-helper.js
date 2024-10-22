const sequelize = require('../config/db')
const { lookupPoliceForceByPostcode, matchPoliceForceByName } = require('../import/robot/police')
const { EXEMPTION } = require('../constants/event/audit-event-object-types')
const { sendUpdateToAudit } = require('../messaging/send-audit')

const returnResult = (changed, reason, numOfDogs, policeForceName) => {
  return {
    changed,
    reason,
    policeForceName,
    numOfDogs
  }
}

const hasForceChanged = async (personId, person, user, transaction) => {
  const dogs = await sequelize.models.registered_person.findAll({
    attributes: ['dog_id'],
    where: { person_id: personId },
    transaction
  })

  const dogIds = dogs.map(dog => dog.dog_id)

  if (dogIds?.length === 0) {
    return returnResult(false, 'No dogs', 0, undefined)
  }

  const forces = await sequelize.models.registration.findAll({
    attributes: ['police_force_id'],
    where: { dog_id: dogIds },
    include: [{
      model: sequelize.models.police_force,
      as: 'police_force'
    }],
    raw: true,
    nest: true,
    transaction
  })

  const currentPoliceForces = []
  for (const force of forces) {
    const forceName = force.police_force?.name ?? 'unknown'
    if (!currentPoliceForces.includes(forceName)) {
      currentPoliceForces.push(forceName)
    }
  }
  const newPoliceForce = person?.address?.country === 'Scotland'
    ? await matchPoliceForceByName('police scotland')
    : await lookupPoliceForceByPostcode(person?.address?.postcode)

  if (currentPoliceForces.length === 1 && newPoliceForce?.name === currentPoliceForces[0]) {
    // No change
    return returnResult(false, 'Same as existing', dogIds?.length, undefined)
  } else if (newPoliceForce?.name) {
    // Change all dogs
    await setPoliceForceOnCdos(newPoliceForce, dogIds, user, transaction)
    return returnResult(true, undefined, dogIds?.length, newPoliceForce.name)
  }
  return returnResult(false, 'Not found', 0, undefined)
}

const setPoliceForceOnCdos = async (policeForce, dogIds, user, transaction) => {
  if (!policeForce?.id) {
    return false
  }

  let madeChanges = false
  for (const dogId of dogIds) {
    const exemption = await sequelize.models.registration.findOne({
      where: { dog_id: dogId },
      include: [{
        model: sequelize.models.police_force,
        as: 'police_force'
      }],
      transaction
    })

    if ((exemption.police_force?.id ?? -1) !== policeForce.id) {
      const preChanged = {
        index_number: `ED${dogId}`,
        police_force: exemption?.police_force?.name
      }

      await sequelize.models.registration.update({
        police_force_id: policeForce.id
      },
      {
        where: { id: exemption.id },
        transaction
      })

      const postChanged = {
        index_number: `ED${dogId}`,
        police_force: policeForce.name
      }

      await sendUpdateToAudit(EXEMPTION, preChanged, postChanged, user)
      madeChanges = true
    }
  }
  return madeChanges
}

module.exports = {
  hasForceChanged,
  setPoliceForceOnCdos
}
