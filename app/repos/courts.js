const sequelize = require('../config/db')
const { NotFoundError } = require('../errors/not-found')
const { DuplicateResourceError } = require('../errors/duplicate-record')

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
 * @param {CourtCreatePayload} court
 * @param user
 * @param [transaction]
 * @returns {Promise<*|undefined>}
 */
const createCourt = async (court, user, transaction) => {
  if (!transaction) {
    return sequelize.transaction(async (t) => createCourt(court, user, t))
  }
  const foundCourt = await sequelize.models.court.findOne({
    where: {
      name: court.name
    },
    transaction
  })

  if (foundCourt !== null) {
    throw new DuplicateResourceError(`Court with name ${court.name} already exists`)
  }
}

const deleteCourt = async () => {}

module.exports = {
  getCourts,
  createCourt,
  deleteCourt
}
