const sequelize = require('../config/db')
const { createPeople } = require('./people')
const { createDogs } = require('./dogs')
const { addToSearchIndex } = require('./search')

const createCdo = async (data, transaction) => {
  if (!transaction) {
    return sequelize.transaction((t) => createCdo(data, t))
  }

  try {
    const owners = await createPeople([data.owner], transaction)
    const dogs = await createDogs(data.dogs, owners, data.enforcementDetails, transaction)

    for (const owner of owners) {
      for (const dog of dogs) {
        await addToSearchIndex(owner, dog.id, transaction)
      }
    }

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
