const sequelize = require('../config/db')

const getBreeds = async () => {
  return sequelize.models.dog_breed.findAll({
    attributes: ['breed']
  })
}

module.exports = {
  getBreeds
}
