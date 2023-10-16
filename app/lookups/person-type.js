const { Op } = require('sequelize')
const sequelize = require('../config/db')

const getPersonType = async type => {
  return await sequelize.models.person_type.findOne({
    attributes: ['id'],
    where: {
      person_type: {
        [Op.iLike]: `%${type}%`
      }
    }
  })
}

module.exports = getPersonType
