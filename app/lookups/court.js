const { Op } = require('sequelize')
const sequelize = require('../config/db')

const getCourt = async court => {
  return await sequelize.models.court.findOne({
    attributes: ['id'],
    where: {
      name: {
        [Op.iLike]: `%${court}%`
      }
    }
  })
}

module.exports = getCourt
