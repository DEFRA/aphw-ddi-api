const sequelize = require('../config/db')

const getForces = async () => {
  return sequelize.models.police_force.findAll({
    attributes: ['name']
  })
}

module.exports = {
  getForces
}
