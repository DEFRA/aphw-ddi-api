/**
 * @typedef GetPersonsFilter
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {Date} [dateOfBirth]
 */
const sequelize = require('../config/db')
/**
 * @param {GetPersonsFilter} queryParams
 */
const getPersons = async (queryParams) => {
  try {
    return await sequelize.models.person.findAll({
      // order: [[sequelize.col('addresses.address.id'), 'DESC']],
      // where: { person_reference: reference },
      // include: [
      //   {
      //     model: sequelize.models.person_address,
      //     as: 'addresses',
      //     include: [
      //       {
      //         model: sequelize.models.address,
      //         as: 'address',
      //         include: [
      //           {
      //             attribute: ['country'],
      //             model: sequelize.models.country,
      //             as: 'country'
      //           }
      //         ]
      //       }
      //     ]
      //   },
      //   {
      //     model: sequelize.models.person_contact,
      //     as: 'person_contacts',
      //     separate: true,
      //     include: [
      //       {
      //         model: sequelize.models.contact,
      //         as: 'contact',
      //         include: [
      //           {
      //             model: sequelize.models.contact_type,
      //             as: 'contact_type'
      //           }
      //         ]
      //       }
      //     ]
      //   }
      // ],
    })
  } catch (err) {
    console.error(`Error getting people: ${err}`)
    throw err
  }
}

module.exports = {
  getPersons
}
