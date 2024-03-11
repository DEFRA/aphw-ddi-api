/**
 * @typedef GetPersonsFilter
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {Date} [dateOfBirth]
 */
const sequelize = require('../config/db')

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
      whereObject[dbColumnKey] = query
    }
    return whereObject
  }, {})
  console.log('~~~~~~ Chris Debug ~~~~~~ ', 'Where', where)

  try {
    return await sequelize.models.person.findAll({
      where,
      include: [
        {
          model: sequelize.models.person_address,
          as: 'addresses',
          include: [
            {
              model: sequelize.models.address,
              as: 'address',
              include: [
                {
                  attribute: ['country'],
                  model: sequelize.models.country,
                  as: 'country'
                }
              ]
            }
          ]
        },
        {
          model: sequelize.models.person_contact,
          as: 'person_contacts',
          separate: true,
          include: [
            {
              model: sequelize.models.contact,
              as: 'contact',
              include: [
                {
                  model: sequelize.models.contact_type,
                  as: 'contact_type'
                }
              ]
            }
          ]
        }
      ],
      // order: [[sequelize.col('person_address.address.id'), 'DESC']],
      limit: MAX_RESULTS,
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
