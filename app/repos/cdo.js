const sequelize = require('../config/db')
const { createPeople } = require('./people')
const { createDogs } = require('./dogs')

const createCdo = async (data) => {
  try {
    return sequelize.transaction(async (t) => {
      const owners = await createPeople([data.owner], t)
      const dogs = await createDogs(data.dogs, owners, t)

      return {
        owner: owners[0],
        dogs
      }
    })
  } catch (err) {
    console.error(`Error creating CDO: ${err}`)
    throw err
  }
}

module.exports = {
  createCdo
}
