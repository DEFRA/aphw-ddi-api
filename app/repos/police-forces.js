const sequelize = require('../config/db')

const getForces = async () => {
  try {
    return sequelize.models.police_force.findAll({
      attributes: ['name']
    })
  } catch (e) {
    console.log(`Error retrieving police forces: ${e}`)
    throw e
  }
}

module.exports = {
  getForces
}
