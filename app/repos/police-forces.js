const sequelize = require('../config/db')

const getForces = async () => {
  try {
    const forces = await sequelize.models.police_force.findAll({
      attributes: ['name']
    })

    return forces
  } catch (e) {
    console.log(`Error retrieving police forces: ${e}`)
    throw e
  }
}

module.exports = {
  getForces
}
