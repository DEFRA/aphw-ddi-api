const sequelize = require('../config/db')
const { DuplicateResourceError } = require('../errors/duplicate-record')
const { sendCreateToAudit, sendDeleteToAudit } = require('../messaging/send-audit')
const { COURT } = require('../constants/event/audit-event-object-types')
const { NotFoundError } = require('../errors/not-found')
const { getFindQuery, findQueryV2, updateParanoid } = require('./shared')

const getCourts = async () => {
  try {
    const courts = await sequelize.models.court.findAll({
      attributes: ['id', 'name'],
      order: [[sequelize.fn('lower', sequelize.col('name')), 'ASC']]
    })

    return courts
  } catch (e) {
    console.log('Error retrieving courts:', e)
    throw e
  }
}

/**
 * @typedef CourtCreatePayload
 * @property {string} name
 */
/**
 * @param {CourtCreatePayload} courtData
 * @param user
 * @param [transaction]
 * @returns {Promise<*|undefined>}
 */
const createCourt = async (courtData, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => createCourt(courtData, user, t))
  }
  const findQuery = getFindQuery(courtData.name, 'name')

  const foundCourt = await sequelize.models.court.findOne(findQuery)

  if (foundCourt !== null) {
    throw new DuplicateResourceError(`Court with name ${courtData.name} is already listed`)
  }

  let court

  const foundParanoid = await sequelize.models.court.findOne({
    ...findQueryV2(courtData.name, 'name'),
    paranoid: false
  })

  if (foundParanoid) {
    court = await updateParanoid(
      foundParanoid,
      { name: courtData.name },
      transaction
    )
  } else {
    court = await sequelize.models.court.create({
      name: courtData.name
    }, { transaction })
  }

  await sendCreateToAudit(COURT, { id: court.id, name: court.name }, user)

  return court
}

const deleteCourt = async (courtId, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => deleteCourt(courtId, user, t))
  }
  const foundCourt = await sequelize.models.court.findOne({
    where: {
      id: courtId
    }
  })

  if (foundCourt === null) {
    throw new NotFoundError(`Court with id ${courtId} does not exist`)
  }

  const destroyedCourt = await sequelize.models.court.destroy({
    where: {
      id: courtId
    },
    transaction
  })

  await sendDeleteToAudit(COURT, foundCourt, user)

  return destroyedCourt
}

module.exports = {
  getCourts,
  createCourt,
  deleteCourt
}
