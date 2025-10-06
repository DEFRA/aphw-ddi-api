const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { personRelationship } = require('./relationships/person')
const { deletePerson } = require('./people')
/**
 * @typedef GetPersonsFilter
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [dateOfBirth]
 * @property {boolean} [orphaned]
 */

/**
 * @typedef {'owner'|'birthDate'|'address'} GetPersonsSortKey
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
          sequelize.fn('LOWER', sequelize.col(dbColumnKey)),
          {
            [Op.like]: `%${query.toLowerCase()}%`
          }
        )
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
  const sortOrder = options.sortOrder ?? 'ASC'

  if (options.sortKey === 'owner') {
    order.push([sequelize.col('last_name'), sortOrder])
    order.push([sequelize.col('first_name'), sortOrder])
  } else if (options.sortKey === 'birthDate') {
    order.push([sequelize.col('birth_date'), sortOrder])
  } else if (options.sortKey === 'address') {
    order.push([sequelize.col('addresses.address.address_line_1'), sortOrder])
  }

  try {
    return await sequelize.models.person.findAll({
      where,
      include: [
        ...personRelationship(sequelize),
        ...optionalIncludes
      ],
      order,
      ...mappedOptions,
      transaction
    })
  } catch (err) {
    console.error('Error getting people:', err)
    throw err
  }
}

const deletePersons = async (personsToDelete, user) => {
  const result = {
    count: {
      failed: 0,
      success: 0
    },
    deleted: {
      failed: [],
      success: []
    }
  }

  for (const personReference of personsToDelete) {
    try {
      await deletePerson(personReference, user)
      result.count.success++
      result.deleted.success.push(personReference)
    } catch (e) {
      console.error('Failed to Delete personReference', e)
      result.count.failed++
      result.deleted.failed.push(personReference)
    }
  }

  return result
}

module.exports = {
  getPersons,
  deletePersons
}
