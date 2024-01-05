const { Op } = require('sequelize')
const sequelize = require('../config/db')

const getExemptionOrder = async order => {
  return await sequelize.models.exemption_order.findOne({
    attributes: ['id'],
    where: {
      exemption_order: {
        [Op.iLike]: `%${order}%`
      }
    }
  })
}

module.exports = getExemptionOrder
