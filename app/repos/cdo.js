const sequelize = require('../config/db')
const { createPeople } = require('./people')
const { createDogs } = require('./dogs')

const createCdo = async (data, transaction) => {
  if (!transaction) {
    return sequelize.transaction((t) => createCdo(data, t))
  }

  try {
    const owners = await createPeople([data.owner], transaction)
    const dogs = await createDogs(data.dogs, owners, data.owner.enforcementDetails, transaction)

    return {
      owner: owners[0],
      dogs
    }
  } catch (err) {
    console.error(`Error creating CDO: ${err}`)
    throw err
  }
}

module.exports = {
  createCdo
}
