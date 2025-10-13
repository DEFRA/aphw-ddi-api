const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { personRelationship } = require('./relationships/person')
const { deletePerson } = require('./people')
const { fuzzySearch } = require('./search-match-codes')
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
function buildWhereClause (queryParams, terms) {
  return Object.keys(dtoToModelMapping).reduce((whereObject, key) => {
    const query = queryParams[key]
    if (query) {
      const dbColumnKey = dtoToModelMapping[key]
      if (dbColumnKey !== 'birth_date') {
        terms.push(query)
        whereObject[dbColumnKey] = sequelize.where(
          sequelize.fn('lower', sequelize.col(dbColumnKey)),
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
}

function applyFuzzySearch (where, personIds) {
  if (personIds && personIds.length > 0) {
    const nameFilters = { ...where }
    delete nameFilters.id
    where[Op.or] = [
      nameFilters,
      { id: { [Op.in]: personIds } }
    ]
    Object.keys(where).forEach(key => {
      if (key !== Op.or) {
        delete where[key]
      }
    })
  }
}

function buildOptionalIncludes (queryParams, where) {
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
  return optionalIncludes
}

function buildOrder (options) {
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
  return order
}

function buildOptions (options) {
  const mappedOptions = { subQuery: false }
  if (options.limit !== -1) {
    mappedOptions.limit = options.limit ?? MAX_RESULTS
  }
  return mappedOptions
}

const getPersons = async (queryParams, options = {}, transaction) => {
  const terms = []
  const where = buildWhereClause(queryParams, terms)
  const personIds = await fuzzySearch(terms)
  applyFuzzySearch(where, personIds)
  const optionalIncludes = buildOptionalIncludes(queryParams, where)
  const mappedOptions = buildOptions(options)
  const order = buildOrder(options)
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
