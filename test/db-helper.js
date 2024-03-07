require('../app/data')
const sequelize = require('../app/config/db')
const { getCountry } = require('../app/lookups')

const truncate = async () => {
  await sequelize.models.search_index.truncate()
  await sequelize.models.comment.truncate()
  await sequelize.models.dog_microchip.truncate()
  await sequelize.models.microchip.destroy({ where: {}, truncate: false })
  await sequelize.models.registration.destroy({ where: {}, truncate: false })
  await sequelize.models.insurance.truncate()
  await sequelize.models.person_address.truncate()
  await sequelize.models.address.destroy({ where: {}, truncate: false })
  await sequelize.models.person_contact.destroy({ where: {}, truncate: false })
  await sequelize.models.contact.destroy({ where: {}, truncate: false })
  await sequelize.models.registered_person.truncate()
  await sequelize.models.person.destroy({ where: {}, truncate: false })
  await sequelize.models.dog.destroy({ where: {}, truncate: false })
}

/**
 * @param {Country[]} countries
 * @returns {Promise<void>}
 */
const createCountryRecords = async (countries) => {
  await sequelize.models.country.bulkCreate(countries)
}

/**
 * @param {Person} [personRequest]
 * @returns {Promise<void>}
 */
const addPerson = async (personRequest) => {
  const defaultPerson = {
    first_name: 'Homer',
    last_name: 'Simpson',
    person_reference: 'P-D9E1-22AD',
    birth_date: '1998-05-10'
  }

  const country = await getCountry('Wales')

  const defaultAddress = {
    address_line_1: '1 Anywhere St',
    address_line_2: 'Anywhere Estate',
    town: 'Pontypridd',
    postcode: 'CF15 7SU',
    country_id: country.id
  }

  const person = await sequelize.models.person.create(defaultPerson)

  const address = await sequelize.models.address.create(defaultAddress)

  await sequelize.models.person_address.create({
    person_id: person.id,
    address_id: address.id
  })
}

const close = async () => {
  await sequelize.close()
}

module.exports = {
  close,
  truncate,
  createCountryRecords,
  addPerson
}
