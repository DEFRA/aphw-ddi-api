const sequelize = require('../config/db')
const { DuplicateResourceError } = require('../errors/duplicate-record')
const { sendCreateToAudit, sendDeleteToAudit, sendUpdateToAudit } = require('../messaging/send-audit')
const { POLICE, EXEMPTION } = require('../constants/event/audit-event-object-types')
const { NotFoundError } = require('../errors/not-found')
const { getFindQuery, updateParanoid, findQueryV2 } = require('./shared')

const getPoliceForces = async () => {
  try {
    const policeForces = await sequelize.models.police_force.findAll({
      attributes: ['id', 'name'],
      order: [[sequelize.fn('lower', sequelize.col('name')), 'ASC']]
    })

    return policeForces
  } catch (e) {
    console.log('Error retrieving police forces:', e)
    throw e
  }
}

const addForce = async (policeForce, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => addForce(policeForce, user, t))
  }

  const findQuery = getFindQuery(policeForce.name, 'name')

  const foundPoliceForce = await sequelize.models.police_force.findOne(findQuery)

  if (foundPoliceForce !== null) {
    throw new DuplicateResourceError(`Police Force with name ${policeForce.name} is already listed`)
  }

  let createdPoliceForce

  const foundParanoid = await sequelize.models.police_force.findOne({
    ...findQueryV2(policeForce.name, 'name'),
    paranoid: false
  })

  if (foundParanoid) {
    createdPoliceForce = await updateParanoid(
      foundParanoid,
      { name: policeForce.name },
      transaction
    )
  } else {
    createdPoliceForce = await sequelize.models.police_force.create({
      name: policeForce.name
    }, { transaction })
  }

  await sendCreateToAudit(POLICE, { id: createdPoliceForce.id, name: createdPoliceForce.name }, user)

  return createdPoliceForce
}

const deleteForce = async (policeForceId, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => deleteForce(policeForceId, user, t))
  }

  const foundPoliceForce = await sequelize.models.police_force.findOne({
    where: {
      id: policeForceId
    }
  })

  if (foundPoliceForce === null) {
    throw new NotFoundError(`Police Force with id ${policeForceId} does not exist`)
  }

  const destroyedPoliceForce = await sequelize.models.police_force.destroy({
    where: {
      id: policeForceId
    },
    transaction
  })

  await sendDeleteToAudit(POLICE, foundPoliceForce, user)

  return destroyedPoliceForce
}

const getPoliceForceByShortName = async (shortName, transaction) => {
  return sequelize.models.police_force.findOne({
    where: { short_name: shortName },
    transaction
  })
}

const setPoliceForceOnCdos = async (policeForce, indexNumbers, user, transaction) => {
  let madeChanges = false
  for (const indexNumber of indexNumbers) {
    const dogId = parseInt(indexNumber.substring(2))
    console.log('JB dogId', dogId)
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
        index_number: indexNumber,
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
        index_number: indexNumber,
        police_force: policeForce.name
      }

      await sendUpdateToAudit(EXEMPTION, preChanged, postChanged, user)
      madeChanges = true
    }
  }
  return madeChanges
}

module.exports = {
  getPoliceForces,
  addForce,
  deleteForce,
  getPoliceForceByShortName,
  setPoliceForceOnCdos
}
