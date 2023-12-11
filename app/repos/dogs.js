const sequelize = require('../config/db')
const { v4: uuidv4 } = require('uuid')
const { getBreed } = require('../lookups')

const getBreeds = async () => {
  try {
    const breeds = await sequelize.models.dog_breed.findAll({
      attributes: ['id', 'breed', 'display_order'],
      order: [
        ['display_order', 'ASC'],
        ['breed', 'ASC']
      ]
    })

    return breeds
  } catch (err) {
    console.error(`Error retrieving dog breeds: ${err}`)
    throw err
  }
}

const createDogs = async (dogs, owners, enforcement, transaction) => {
  if (!transaction) {
    return sequelize.transaction(async (t) => createDogs(dogs, owners, enforcement, t))
  }

  try {
    const createdDogs = []

    for (const dog of dogs) {
      const breed = await getBreed(dog.breed)

      const dogEntity = await sequelize.models.dog.create({
        name: dog.name,
        dog_breed_id: breed.id,
        exported: false,
        status_id: 1,
        dog_reference: uuidv4()
      }, { transaction })

      const dogResult = await sequelize.models.dog.findByPk(dogEntity.id, {
        include: [{
          attributes: ['breed'],
          model: sequelize.models.dog_breed,
          as: 'dog_breed'
        }],
        raw: true,
        nest: true,
        transaction
      })

      const registrationEntity = await sequelize.models.registration.create({
        dog_id: dogEntity.id,
        cdo_issued: dog.cdoIssued,
        cdo_expiry: dog.cdoExpiry,
        police_force_id: enforcement.policeForce,
        court_id: enforcement.court,
        legislation_officer: enforcement.legislationOfficer,
        status_id: 1
      }, { transaction })

      const createdRegistration = await sequelize.models.registration.findByPk(registrationEntity.id, {
        include: [{
          attributes: ['name'],
          model: sequelize.models.police_force,
          as: 'police_force'
        },
        {
          attributes: ['name'],
          model: sequelize.models.court,
          as: 'court'
        }],
        raw: true,
        nest: true,
        transaction
      })

      for (const owner of owners) {
        await sequelize.models.registered_person.create({
          person_id: owner.id,
          dog_id: dogEntity.id,
          person_type_id: 1
        }, { transaction })
      }

      createdDogs.push({ ...dogResult, registration: createdRegistration })
    }

    return createdDogs
  } catch (err) {
    console.error(`Error creating dog: ${err}`)
    throw err
  }
}

const addImportedRegisteredPerson = async (personId, personTypeId, dogId, t) => {
  const registeredPerson = {
    person_id: personId,
    dog_id: dogId,
    person_type_id: personTypeId
  }
  await sequelize.models.registered_person.create(registeredPerson, { transaction: t })
}

const addImportedDog = async (dog, transaction) => {
  if (!transaction) {
    return sequelize.transaction(async (t) => addImportedDog(dog, t))
  }

  const newDog = await sequelize.models.dog.create(dog, { transaction })

  if (dog.owner) {
    await addImportedRegisteredPerson(dog.owner, 1, newDog.id, transaction)
  }

  if (dog.keeper) {
    await addImportedRegisteredPerson(dog.keeper, 2, newDog.id, transaction)
  }
  return newDog.id
}

module.exports = {
  getBreeds,
  createDogs,
  addImportedDog
}
