const { Op } = require("sequelize");
const sequelize = require('../config/db')

const statusIdentifer = 'DOG'

const getDogStatus = async () => {
  return await sequelize.models.status.findOne({
    attributes: ['id'],
    where: {
      status_type: {
        [Op.eq]: statusIdentifer
      }
    }
  })
} 

module.exports = getDogStatus
