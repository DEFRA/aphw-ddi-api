const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { personRelationship } = require('./relationships/person')
const { mapPersonDaoToPersonDaoWithLatestAddress } = require('./mappers/person')
/**
 * @typedef GetPersonsFilter
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [dateOfBirth]
 * @property {boolean} [orphaned]
 */
/**
 * @typedef GetPersonsOptions
 * @property {number} [limit]
 * @property {string} [sortKey]
 * @property {string} [sortOrder]
 */
const MAX_RESULTS = 20

const dtoToModelMapping = {
  firstName: 'first_name',
  lastName: 'last_name',
  dateOfBirth: 'birth_date'
}

/**
 * @param {GetPersonsFilter} queryParams
 * @param {GetPersonsOptions} [options]
 * @param [transaction]
 */
const getPersons = async (queryParams, options = {}, transaction) => {
  /**
   * @type {{first_name?: string, last_name?: string, birth_date?: string}}
   */
  const where = Object.keys(dtoToModelMapping).reduce((whereObject, key) => {
    const query = queryParams[key]

    if (query) {
      const dbColumnKey = dtoToModelMapping[key]

      if (dbColumnKey !== 'birth_date') {
        whereObject[dbColumnKey] = sequelize.where(
          sequelize.fn('lower', sequelize.col(dbColumnKey)), `${query.toLowerCase()}`)
      } else {
        whereObject[dbColumnKey] = {
          [Op.or]: {
            [Op.eq]: `${query}`,
            [Op.is]: null
          }
        }
      }
    }

    return whereObject
  }, {})

  const optionalIncludes = []

  if (queryParams.orphaned) {
    optionalIncludes.push({
      model: sequelize.models.registered_person,
      as: 'registered_people'
    })

    where['$registered_people.dog_id$'] = {
      [Op.is]: null
    }
  }

  const mappedOptions = {
    subQuery: false
  }

  if (options.limit !== -1) {
    mappedOptions.limit = options.limit ?? MAX_RESULTS
  }

  const order = []

  if (options.sortKey === 'owner') {
    const sortOrder = options.sortOrder ?? 'ASC'
    order.push([sequelize.col('last_name'), sortOrder])
    order.push([sequelize.col('first_name'), sortOrder])
  }

  try {
    const results = await sequelize.models.person.findAll({
      where,
      include: [
        ...personRelationship(sequelize),
        ...optionalIncludes
      ],
      order,
      ...mappedOptions,
      transaction
    })

    return results.map(mapPersonDaoToPersonDaoWithLatestAddress)
  } catch (err) {
    console.error(`Error getting people: ${err}`)
    throw err
  }
}

module.exports = {
  getPersons
}
