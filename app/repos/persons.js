const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { personTableRelationships } = require('./relationships/person')
/**
 * @typedef GetPersonsFilter
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {Date} [dateOfBirth]
 */
const MAX_RESULTS = 20

const dtoToModelMapping = {
  firstName: 'first_name',
  lastName: 'last_name',
  dateOfBirth: 'birth_date'
}

/**
 * @param {GetPersonsFilter} queryParams
 */
const getPersons = async (queryParams, transaction) => {
  /**
   * @type {{first_name?: string, last_name?: string, birth_date?: string}}
   */
  const where = Object.keys(dtoToModelMapping).reduce((whereObject, key) => {
    const query = queryParams[key]

    if (query) {
      const dbColumnKey = dtoToModelMapping[key]
      whereObject[dbColumnKey] = dbColumnKey !== 'birth_date'
        ? sequelize.where(
          sequelize.fn('lower', sequelize.col(dbColumnKey)), `${query.toLowerCase()}`)
        : { [Op.eq]: `${query}` }
    }

    return whereObject
  }, {})

  try {
    return await sequelize.models.person.findAll({
      where,
      include: personTableRelationships(sequelize),
      order: [[sequelize.col('addresses.address.id'), 'DESC']],
      limit: MAX_RESULTS,
      subQuery: false,
      transaction
    })
  } catch (err) {
    console.error(`Error getting people: ${err}`)
    throw err
  }
}

module.exports = {
  getPersons
}
