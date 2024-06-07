const { Op } = require('sequelize')
const sequelize = require('../config/db')

const statusIdentifer = 'REGISTRATION'

const getRegistrationStatus = async () => {
  return await sequelize.models.status.findOne({
    attributes: ['id'],
    where: {
      status_type: {
        [Op.eq]: statusIdentifer
      }
    }
  })
}

module.exports = getRegistrationStatus
