const sequelize = require('../config/db')
const { DuplicateResourceError } = require('../errors/duplicate-record')
const { sendCreateToAudit, sendDeleteToAudit } = require('../messaging/send-audit')
const { extractShortNameAndDomain } = require('../lib/string-helpers')
const { POLICE } = require('../constants/event/audit-event-object-types')
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

const lookupPoliceForceByEmail = async (email) => {
  if (!email) {
    return 'unknown'
  }
  const { domain, shortName } = extractShortNameAndDomain(email)
  const force = await getPoliceForceByShortName(shortName)
  return force ? force.name : domain
}

module.exports = {
  getPoliceForces,
  addForce,
  deleteForce,
  getPoliceForceByShortName,
  lookupPoliceForceByEmail
}
