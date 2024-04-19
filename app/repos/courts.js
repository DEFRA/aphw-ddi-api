const sequelize = require('../config/db')
const { DuplicateResourceError } = require('../errors/duplicate-record')
const { sendCreateToAudit } = require('../messaging/send-audit')
const { COURT } = require('../constants/event/audit-event-object-types')

const getCourts = async () => {
  try {
    const courts = await sequelize.models.court.findAll({
      attributes: ['id', 'name']
    })

    return courts
  } catch (e) {
    console.log(`Error retrieving courts: ${e}`)
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
  const foundCourt = await sequelize.models.court.findOne({
    where: {
      name: courtData.name
    }
  }, { transaction })

  if (foundCourt !== null) {
    throw new DuplicateResourceError(`Court with name ${courtData.name} already exists`)
  }

  const court = await sequelize.models.court.create({
    name: courtData.name
  }, { transaction })

  await sendCreateToAudit(COURT, { id: court.id, name: court.name }, user)

  return court
}

const deleteCourt = async () => {

}

module.exports = {
  getCourts,
  createCourt,
  deleteCourt
}
