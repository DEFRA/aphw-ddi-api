const { Op } = require("sequelize");
const sequelize = require('../config/db')

const getBreed = async breed => {
  return await sequelize.models.dog_breed.findOne({
    attributes: ['id'],
    where: {
      breed: {
        [Op.iLike]: `%${breed}%`
      }
    }
  })
} 

module.exports = getBreed
