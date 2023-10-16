const { Op } = require("sequelize");
const sequelize = require('../config/db')

const getCountry = async country => {
  return await sequelize.models.country.findOne({
    attributes: ['id'],
    where: {
      country: {
        [Op.iLike]: `%${country}%`
      }
    }
  })
} 

module.exports = getCountry
