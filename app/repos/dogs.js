const sequelize = require('../config/db')
const { v4: uuidv4 } = require('uuid')
const { getBreed, getExemptionOrder } = require('../lookups')
const { updateSearchIndexDog } = require('../repos/search')
const { updateMicrochips, createMicrochip } = require('./microchip')
const { createInsurance } = require('./insurance')

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
        id: dog.indexNumber ?? undefined,
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

      let exemptionOrder

      if (dog.source === 'ROBOT') {
        exemptionOrder = await getExemptionOrder('2023')
      } else {
        exemptionOrder = await getExemptionOrder('2015')
      }

      const registrationEntity = await sequelize.models.registration.create({
        dog_id: dogEntity.id,
        cdo_issued: dog.cdoIssued,
        cdo_expiry: dog.cdoExpiry,
        police_force_id: enforcement.policeForce,
        court_id: enforcement.court,
        legislation_officer: enforcement.legislationOfficer,
        status_id: 1,
        exemption_order: exemptionOrder.id
      }, { transaction })

      if (dog.insurance) {
        createInsurance(dogEntity.id, dog.insurance, transaction)
      }

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
    await createMicrochip(dog.microchip_number, newDog.id, transaction)
  }

  if (dog.owner) {
    await addImportedRegisteredPerson(dog.owner, 1, newDog.id, transaction)
  }

  return newDog.id
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
  updateDogFields,
  updateMicrochips
}
