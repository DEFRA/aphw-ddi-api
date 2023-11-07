const { Op } = require('sequelize')
const sequelize = require('../config/db')

const getContactType = async type => {
  return await sequelize.models.contact_type.findOne({
    attributes: ['id'],
    where: {
      contact_type: {
        [Op.iLike]: `%${type}%`
      }
    }
  })
}

module.exports = getContactType
