const { Op } = require("sequelize");
const sequelize = require('../config/db')

const getPoliceForce = async name => {
  return await sequelize.models.police_force.findOne({
    attributes: ['id'],
    where: {
      name: {
        [Op.iLike]: `%${name}%`
      }
    }
  })
} 

module.exports = getPoliceForce
