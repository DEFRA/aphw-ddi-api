const sequelize = require('../config/db')

const getCountries = async () => {
  return await sequelize.models.country.findAll({
    attributes: ['country']
  })
}

module.exports = {
  getCountries
}
