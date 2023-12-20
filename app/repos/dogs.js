const sequelize = require('../config/db')
const { v4: uuidv4 } = require('uuid')
const { getBreed } = require('../lookups')
const { updateSearchIndexDog } = require('../repos/search')

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

  if (dog.microchip_number) {
    await createMicrochip(dog.microchip_number, newDog.id, 1, transaction)
  }

  if (dog.owner) {
    await addImportedRegisteredPerson(dog.owner, 1, newDog.id, transaction)
  }

  return newDog.id
}

const createMicrochip = async (microchipNumber, dogId, displayOrder, transaction) => {
  const microchip = {
    microchip_number: microchipNumber,
    display_order: displayOrder
  }
  const newMicrochip = await sequelize.models.microchip.create(microchip, { transaction })
  const dogMicrochip = {
    dog_id: dogId,
    microchip_id: newMicrochip.id
  }
  await sequelize.models.dog_microchip.create(dogMicrochip, { transaction })
}

const updateDog = async (payload, transaction) => {
  if (!transaction) {
    return sequelize.transaction(async (t) => updateDog(payload, t))
  }

  const dogFromDB = await getDogByIndexNumber(payload.indexNumber)

  const breeds = await getBreeds()

  updateDogFields(dogFromDB, payload, breeds)

  await updateMicrochips(dogFromDB, payload, transaction)

  await dogFromDB.save({ transaction })

  await updateSearchIndexDog(payload, transaction)

  return dogFromDB
}

const updateDogFields = (dbDog, payload, breeds) => {
  dbDog.dog_breed_id = breeds.filter(x => x.breed === payload.breed)[0].id
  dbDog.name = payload.name
  dbDog.birth_date = payload.dateOfBirth
  dbDog.death_date = payload.dateOfDeath
  dbDog.tattoo = payload.tattoo
  dbDog.colour = payload.colour
  dbDog.sex = payload.sex
  dbDog.exported_date = payload.dateExported
  dbDog.stolen_date = payload.dateStolen
}

const updateMicrochips = async (dogFromDb, payload, transaction) => {
  const existingMicrochip1 = await getMicrochipDetails(dogFromDb.id, 1)
  const existingMicrochip2 = await getMicrochipDetails(dogFromDb.id, 2)
  if (existingMicrochip1 !== payload.microchipNumber) {
    if (existingMicrochip1) {
      existingMicrochip1.microchip_number = payload.microchipNumber
      await existingMicrochip1.save({ transaction })
    } else {
      await createMicrochip(payload.microchipNumber, dogFromDb.id, 1, transaction)
    }
  }
  if (existingMicrochip2 !== payload.microchipNumber2) {
    if (existingMicrochip2) {
      existingMicrochip2.microchip_number = payload.microchipNumber2
      await existingMicrochip2.save({ transaction })
    } else {
      await createMicrochip(payload.microchipNumber2, dogFromDb.id, 2, transaction)
    }
  }
}

const getMicrochipDetails = async (dogId, displayOrder, transaction) => {
  return await sequelize.models.microchip.findOne({
    where: { display_order: displayOrder },
    include: [{
      model: sequelize.models.dog_microchip,
      as: 'dog_microchips',
      where: { dog_id: dogId }
    }],
    transaction
  })
}

const getDogByIndexNumber = async (indexNumber) => {
  const dog = await sequelize.models.dog.findOne({
    where: { index_number: indexNumber },
    include: [{
      model: sequelize.models.registered_person,
      as: 'registered_person',
      include: [{
        model: sequelize.models.person,
        as: 'person',
        include: [{
          model: sequelize.models.person_address,
          as: 'addresses',
          include: [{
            model: sequelize.models.address,
            as: 'address',
            include: [{
              attribute: ['country'],
              model: sequelize.models.country,
              as: 'country'
            }]
          }]
        },
        {
          model: sequelize.models.person_contact,
          as: 'person_contacts',
          include: [{
            model: sequelize.models.contact,
            as: 'contact',
            include: [{
              model: sequelize.models.contact_type,
              as: 'contact_type'
            }]
          }]
        }]
      },
      {
        model: sequelize.models.person_type,
        as: 'person_type'
      }]
    },
    {
      model: sequelize.models.dog_breed,
      as: 'dog_breed'
    },
    {
      model: sequelize.models.dog_microchip,
      as: 'dog_microchips',
      include: [{
        model: sequelize.models.microchip,
        as: 'microchip'
      }]
    },
    {
      model: sequelize.models.status,
      as: 'status'
    }]
  })
  // Workaround due to Sequelize bug when using 'raw: true'
  // Multiple rows aren't returned from an array when using 'raw: true'
  // so the temporary solution is to omit 'raw: true'
  return dog
}

const getAllDogIds = async () => {
  return sequelize.models.dog.findAll({ attributes: ['id'] })
}

module.exports = {
  getBreeds,
  createDogs,
  addImportedDog,
  updateDog,
  getAllDogIds,
  getDogByIndexNumber,
  updateDogFields
}
