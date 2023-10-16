const { Op } = require("sequelize");
const sequelize = require('../config/db')

const getTitle = async title => {
  return await sequelize.models.title.findOne({
    attributes: ['id'],
    where: {
      title: {
        [Op.iLike]: `%${title}%`
      }
    }
  })
} 

module.exports = getTitle
