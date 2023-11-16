const sequelize = require('../config/db')

const addRegisteredPerson = async (personId, personTypeId, dogId, t) => {
  const registeredPerson = {
    person_id: personId,
    dog_id: dogId,
    person_type_id: personTypeId
  }
  await sequelize.models.registered_person.create(registeredPerson, { transaction: t })
}

const addDog = async (dog) => {
  sequelize.transaction(async (t) => {
    const createdDog = await sequelize.models.dog.create(dog, { transaction: t })

    if (dog.owner) {
      await addRegisteredPerson(dog.owner, 1, createdDog.id, t)
    }

    if (dog.keeper) {
      await addRegisteredPerson(dog.keeper, 2, createdDog.id, t)
    }
  })
}

module.exports = addDog
