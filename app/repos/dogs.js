const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { v4: uuidv4 } = require('uuid')

const getBreeds = async () => {
  try {
    const breeds = await sequelize.models.dog_breed.findAll({
      attributes: ['id', 'breed', 'order'],
      order: [
        ['order', 'ASC'],
        ['breed', 'ASC']
      ]
    })

    return breeds
  } catch (err) {
    console.error(`Error retrieving dog breeds: ${err}`)
    throw err
  }
}

const lookupBreed = async (breed) => {
  try {
    const dogBreed = await sequelize.models.dog_breed.findOne({
      attributes: ['id'],
      where: {
        breed: {
          [Op.iLike]: `%${breed}%`
        }
      }
    })

    if (!dogBreed) {
      throw new Error(`Dog breed ${breed} not found`)
    }

    return dogBreed
  } catch (err) {
    console.error(`Error looking up dog breed: ${err}`)
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
      const breed = await lookupBreed(dog.breed)

      const createdDog = await sequelize.models.dog.create({
        name: dog.name,
        dog_breed_id: breed.id,
        exported: false,
        status_id: 1,
        dog_reference: uuidv4()
      }, { transaction })

      const registration = await sequelize.models.registration.create({
        dog_id: createdDog.id,
        cdo_issued: dog.cdoIssued,
        cdo_expiry: dog.cdoExpiry,
        police_force_id: enforcement.policeForce,
        court_id: enforcement.court,
        status_id: 1
      }, { transaction })

      for (const owner of owners) {
        await sequelize.models.registered_person.create({
          person_id: owner.id,
          dog_id: createdDog.id,
          person_type_id: 1,
        }, { transaction })
      }

      createdDogs.push({ ...createdDog.dataValues, ...registration.dataValues })
    }

    return createdDogs
  } catch (err) {
    console.error(`Error creating dog: ${err}`)
    throw err
  }
}

module.exports = {
  getBreeds,
  lookupBreed,
  createDogs
}
