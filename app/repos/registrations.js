const sequelize = require('../config/db')

const createRegistration = async (data, transaction) => {
  try {
    const dog = await sequelize.models.dog.create(data, { transaction })

    return dog
  } catch (err) {
    console.error(`Error creating dog: ${err}`)
    throw err
  }
}

module.exports = {
  createRegistration
}
