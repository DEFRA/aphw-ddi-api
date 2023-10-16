const { Op } = require('sequelize')
const sequelize = require('../config/db')

const getMicrochipType = async type => {
  return await sequelize.models.microchip_type.findOne({
    attributes: ['id'],
    where: {
      type: {
        [Op.iLike]: `%${type}%`
      }
    }
  })
}

module.exports = getMicrochipType
