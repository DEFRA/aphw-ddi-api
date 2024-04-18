const sequelize = require('../config/db')

const getCourts = async () => {
  try {
    const courts = await sequelize.models.court.findAll({
      attributes: ['id', 'name']
    })

    return courts
  } catch (e) {
    console.log(`Error retrieving courts: ${e}`)
    throw e
  }
}

const createCourt = async () => {}

const deleteCourt = async () => {}

module.exports = {
  getCourts,
  createCourt,
  deleteCourt
}
