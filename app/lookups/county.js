const { Op } = require("sequelize");
const sequelize = require('../config/db')

const getCounty = async county => {
  return await sequelize.models.county.findOne({
    attributes: ['id'],
    where: {
      county: {
        [Op.iLike]: `%${county}%`
      }
    }
  })
} 

module.exports = getCounty
