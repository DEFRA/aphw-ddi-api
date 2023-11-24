const sequelize = require('../config/db')
const { dbCreate } = require('../lib/db-functions')

const addRegisteredPerson = async (personId, personTypeId, dogId, t) => {
  const registeredPerson = {
    person_id: personId,
    dog_id: dogId,
    person_type_id: personTypeId
  }
  await dbCreate(sequelize.models.registered_person, registeredPerson, { transaction: t })
}

const addDog = async (dog) => {
  let newDog
  await sequelize.transaction(async (t) => {
    newDog = await dbCreate(sequelize.models.dog, dog, { transaction: t })

    if (dog.owner) {
      await addRegisteredPerson(dog.owner, 1, newDog.id, t)
    }

    if (dog.keeper) {
      await addRegisteredPerson(dog.keeper, 2, newDog.id, t)
    }
  })
  return newDog.id
}

module.exports = addDog
