const sequelize = require('../config/db')

const getCounties = async () => {
  return await sequelize.models.county.findAll({
    attributes: ['county']
  })
}

module.exports = {
  getCounties
}
