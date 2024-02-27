require('../app/data')
const sequelize = require('../app/config/db')

const truncate = async () => {
  await sequelize.models.country.destroy({ where: {}, truncate: false })
}

/**
 * @param {Country[]} countries
 * @returns {Promise<void>}
 */
const createCountryRecords = async (countries) => {
  await sequelize.models.country.bulkCreate(countries)
}

const close = async () => {
  await sequelize.close()
}

module.exports = {
  close,
  truncate,
  createCountryRecords
}
