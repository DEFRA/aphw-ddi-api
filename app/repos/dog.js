const sequelize = require('../config/db')

const getBreeds = async () => {
  try {
    const breeds = await sequelize.models.dog_breed.findAll({
      attributes: ['id', 'breed']
    })

    return breeds
  } catch (err) {
    console.error(`Error retrieving dog breeds: ${err}`)
    throw err
  }
}

module.exports = {
  getBreeds
}
