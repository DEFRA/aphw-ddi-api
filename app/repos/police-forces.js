const sequelize = require('../config/db')

const getPoliceForces = async () => {
  try {
    const policeForces = await sequelize.models.police_force.findAll({
      attributes: ['id', 'name']
    })

    return policeForces
  } catch (e) {
    console.log(`Error retrieving police forces: ${e}`)
    throw e
  }
}

const addForce = (policeForce, user) => ({})

const deleteForce = (policeForceId, user) => {}

module.exports = {
  getPoliceForces,
  addForce,
  deleteForce
}
