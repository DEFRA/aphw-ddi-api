const sequelize = require('../config/db')
const { lookupPoliceForceByPostcode } = require('../import/robot/police')
const { getPoliceForceByShortName } = require('../repos/police-forces')
const { EXEMPTION } = require('../constants/event/audit-event-object-types')
const { sendUpdateToAudit } = require('../messaging/send-audit')
const { getAccount } = require('../repos/user-accounts')

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
    ? await getPoliceForceByShortName('scotland')
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

      await sequelize.models.search_index.update({
        police_force_id: policeForce.id
      },
      {
        where: { dog_id: dogId },
        transaction
      })
    }
  }
  return madeChanges
}

const getUsersForceList = async (user) => {
  const account = await getAccount(user?.username?.toLowerCase())
  const usersMainPoliceForceId = account?.police_force_id
  if (usersMainPoliceForceId) {
    const forceGroup = await sequelize.models.police_force_group_item.findOne({
      where: { police_force_id: usersMainPoliceForceId }
    })
    if (forceGroup?.police_force_group_id) {
      const policeForces = await sequelize.models.police_force_group_item.findAll({
        where: { police_force_group_id: forceGroup.police_force_group_id }
      })
      return policeForces.map(force => force.police_force_id)
    }
  }
  return usersMainPoliceForceId ? [usersMainPoliceForceId] : undefined
}

const getUsersForceGroupName = async (username) => {
  const account = await getAccount(username?.toLowerCase())
  const usersMainPoliceForceId = account?.police_force_id

  if (usersMainPoliceForceId) {
    const forceGroup = await sequelize.models.police_force_group_item.findOne({
      where: { police_force_id: usersMainPoliceForceId }
    })

    if (forceGroup?.police_force_group_id) {
      const group = await sequelize.models.police_force_group.findOne({
        where: { id: forceGroup.police_force_group_id }
      })
      return group.display_text
    }

    const forceName = await sequelize.models.police_force.findOne({
      where: { id: usersMainPoliceForceId }
    })

    return forceName?.name ?? undefined
  }

  return undefined
}

module.exports = {
  hasForceChanged,
  setPoliceForceOnCdos,
  getUsersForceList,
  getUsersForceGroupName
}
