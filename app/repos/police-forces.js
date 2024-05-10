const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { DuplicateResourceError } = require('../errors/duplicate-record')
const { sendCreateToAudit, sendDeleteToAudit } = require('../messaging/send-audit')
const { POLICE } = require('../constants/event/audit-event-object-types')
const { NotFoundError } = require('../errors/not-found')

const getPoliceForces = async () => {
  try {
    const policeForces = await sequelize.models.police_force.findAll({
      attributes: ['id', 'name']
    })

    return policeForces
  } catch (e) {
    console.log(`Error retrieving police forces: ${e}`)
    throw e
  }
}

const addForce = async (policeForce, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => addForce(policeForce, user, t))
  }

  const findQuery = {
    where: {
      name: {
        [Op.iLike]: `%${policeForce.name}%`
      }
    }
  }
  const foundPoliceForce = await sequelize.models.police_force.findOne(findQuery)

  if (foundPoliceForce !== null) {
    throw new DuplicateResourceError(`Police Force with name ${policeForce.name} already exists`)
  }

  let createdPoliceForce

  const foundParanoid = await sequelize.models.police_force.findOne({
    ...findQuery,
    paranoid: false
  })

  if (foundParanoid) {
    await sequelize.models.police_force.restore({
      where: {
        id: foundParanoid.id
      },
      transaction
    })
    createdPoliceForce = foundParanoid
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

module.exports = {
  getPoliceForces,
  addForce,
  deleteForce
}
