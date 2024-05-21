const sequelize = require('../config/db')
const { v4: uuidv4 } = require('uuid')
const constants = require('../constants/statuses')
const { getBreed, getExemptionOrder } = require('../lookups')
const { updateSearchIndexDog } = require('../repos/search')
const { updateMicrochips, createMicrochip } = require('./microchip')
const { createInsurance } = require('./insurance')
const { sendCreateToAudit, sendUpdateToAudit, sendDeleteToAudit } = require('../messaging/send-audit')
const { DOG } = require('../constants/event/audit-event-object-types')
const { preChangedDogAudit, postChangedDogAudit } = require('../dto/auditing/dog')
const { removeDogFromSearchIndex } = require('./search')

/**
 * @typedef DogDao
 * @property {number} id
 * @property {string} dog_reference
 * @property {string} index_number
 * @property {number} dog_breed_id
 * @property {DogBreedDao} dog_breed
 * @property {number} status_id
 * @property {{ id: number, status: string, status_type: string }} status
 * @property {string|null} name
 * @property {Date|null} birth_date
 * @property {Date|null} death_date
 * @property {string|null} tattoo
 * @property {string|null} colour
 * @property {string|null} sex
 * @property {Date|null} exported_date
 * @property {Date|null} stolen_date
 * @property {Date|null} untraceable_date
 * @property {DogMicrochipDao[]} dog_microchips
 */

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

const getStatuses = async () => {
  try {
    const statuses = await sequelize.models.status.findAll({
      attributes: ['id', 'status', 'status_type'],
      order: [
        ['id', 'ASC']
      ]
    })

    return statuses
  } catch (err) {
    console.error(`Error retrieving statuses: ${err}`)
    throw err
  }
}

const isExistingDog = (dog) => {
  const dogIndexNumber = `${dog.indexNumber}`
  return dogIndexNumber !== '' && dogIndexNumber.indexOf('ED') > -1
}

const createDogs = async (dogs, owners, enforcement, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => createDogs(dogs, owners, enforcement, t))
  }

  try {
    const createdDogs = []

    const statuses = await getStatuses()

    for (const dog of dogs) {
      const existingDog = isExistingDog(dog)

      const breed = await getBreed(dog.breed)

      const dogEntity = await getOrCreateDog(dog, statuses, breed, transaction)

      const dogResult = await refreshDogData(dogEntity.id, transaction)
      dogResult.existingDog = existingDog

      const exemptionOrder = await getExemptionOrder(dog.source === 'ROBOT' ? '2023' : '2015')

      const registrationEntity = await createRegistration(dogEntity, dog, enforcement, exemptionOrder, transaction)

      const createdRegistration = await refreshRegistrationData(registrationEntity.id, transaction)

      await handleInsuranceAndMicrochipAndRegPerson(dogEntity, dog, dogResult, owners, transaction)

      createdDogs.push({ ...dogResult, registration: createdRegistration })
    }

    return createdDogs
  } catch (err) {
    console.error(`Error creating dog: ${err}`)
    throw err
  }
}

const handleInsuranceAndMicrochipAndRegPerson = async (dogEntity, dog, dogResult, owners, transaction) => {
  if (!dogResult.existingDog) {
    if (dog.insurance) {
      await createInsurance(dogEntity.id, dog.insurance, transaction)
    }

    if (dog.microchipNumber) {
      await createMicrochip(dog.microchipNumber, dogEntity.id, transaction)
    }

    for (const owner of owners) {
      await sequelize.models.registered_person.create({
        person_id: owner.id,
        dog_id: dogEntity.id,
        person_type_id: 1
      }, { transaction })
    }
  }
  dogResult.microchipNumber = dog.microchipNumber
}

const getOrCreateDog = async (dog, statuses, breed, transaction) => {
  if (isExistingDog(dog)) {
    const dogEntity = await getDogByIndexNumber(dog.indexNumber, transaction)
    dogEntity.status_id = determineStartingStatus(dog, statuses)
    await dogEntity.save({ transaction })
    return dogEntity
  } else {
    return await sequelize.models.dog.create({
      id: dog.indexNumber ?? undefined,
      name: dog.name,
      dog_breed_id: breed.id,
      exported: false,
      status_id: determineStartingStatus(dog, statuses),
      dog_reference: uuidv4(),
      sex: dog.sex,
      colour: dog.colour,
      birth_date: dog.birthDate
    }, { transaction })
  }
}

const refreshDogData = async (dogId, transaction) => {
  return await sequelize.models.dog.findByPk(dogId, {
    include: [{
      attributes: ['breed'],
      model: sequelize.models.dog_breed,
      as: 'dog_breed'
    },
    {
      model: sequelize.models.status,
      as: 'status'
    }],
    raw: true,
    nest: true,
    transaction
  })
}

const refreshRegistrationData = async (regId, transaction) => {
  return await sequelize.models.registration.findByPk(regId, {
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
}

const createRegistration = async (dogEntity, dog, enforcement, exemptionOrder, transaction) => {
  if (isExistingDog(dog)) {
    await sequelize.models.registration.destroy({
      where: { dog_id: dogEntity.id },
      transaction
    })
  }

  return await sequelize.models.registration.create({
    dog_id: dogEntity.id,
    cdo_issued: dog.cdoIssued,
    cdo_expiry: dog.cdoExpiry,
    joined_exemption_scheme: dog.interimExemption,
    police_force_id: enforcement.policeForce,
    court_id: enforcement.court,
    legislation_officer: enforcement.legislationOfficer,
    status_id: 1,
    certificate_issued: dog.certificateIssued,
    exemption_order_id: exemptionOrder.id,
    application_fee_paid: dog.applicationFeePaid,
    microchip_deadline: dog.microchipDeadline,
    neutering_deadline: dog.neuteringDeadline
  }, { transaction })
}

const getStatusId = (statuses, statusName) => {
  return statuses.filter(x => x.status === statusName)[0].id
}

const determineStartingStatus = (dog, statuses) => {
  const interim = dog.interimExemption
    ? getStatusId(statuses, constants.statuses.InterimExempt)
    : getStatusId(statuses, constants.statuses.PreExempt)

  return (dog.source === 'ROBOT')
    ? getStatusId(statuses, constants.statuses.Exempt)
    : interim
}

const addImportedRegisteredPerson = async (personId, personTypeId, dogId, t) => {
  const registeredPerson = {
    person_id: personId,
    dog_id: dogId,
    person_type_id: personTypeId
  }
  await sequelize.models.registered_person.create(registeredPerson, { transaction: t })
}

const addImportedDog = async (dog, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => addImportedDog(dog, user, t))
  }

  const newDog = await sequelize.models.dog.create(dog, { transaction })

  if (dog.microchip_number) {
    await createMicrochip(dog.microchip_number, newDog.id, transaction)
  }

  if (dog.owner) {
    await addImportedRegisteredPerson(dog.owner, 1, newDog.id, transaction)
  }

  await sendCreateToAudit(DOG, dog, user)

  return newDog.id
}

const updateDog = async (payload, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => updateDog(payload, user, t))
  }

  const dogFromDB = await getDogByIndexNumber(payload.indexNumber)

  const preChangedDog = preChangedDogAudit(dogFromDB)

  const breeds = await getBreeds()

  const statuses = await getStatuses()

  updateDogFields(dogFromDB, payload, breeds, statuses)

  await updateMicrochips(dogFromDB, payload, transaction)

  await dogFromDB.save({ transaction })

  const refreshedDog = await getDogByIndexNumber(payload.indexNumber, transaction)

  await updateSearchIndexDog(refreshedDog, statuses, transaction)

  await sendUpdateToAudit(DOG, preChangedDog, postChangedDogAudit(refreshedDog), user)

  return dogFromDB
}

const updateStatus = async (indexNumber, newStatus, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => updateStatus(indexNumber, newStatus, t))
  }

  const statuses = await getStatuses()

  const dogFromDB = await getDogByIndexNumber(indexNumber, transaction)

  dogFromDB.status_id = statuses.filter(x => x.status === newStatus)[0].id

  await dogFromDB.save({ transaction })

  const refreshedDog = await getDogByIndexNumber(indexNumber, transaction)

  await updateSearchIndexDog(refreshedDog, statuses, transaction)

  return newStatus
}

const updateDogFields = (dbDog, payload, breeds, statuses) => {
  autoChangeStatus(dbDog, payload, statuses)
  dbDog.dog_breed_id = breeds.filter(x => x.breed === payload.breed)[0].id
  dbDog.name = payload.name
  dbDog.birth_date = payload.dateOfBirth
  dbDog.death_date = payload.dateOfDeath
  dbDog.tattoo = payload.tattoo
  dbDog.colour = payload.colour
  dbDog.sex = payload.sex
  dbDog.exported_date = payload.dateExported
  dbDog.stolen_date = payload.dateStolen
  dbDog.untraceable_date = payload.dateUntraceable
}

const autoChangeStatus = (dbDog, payload, statuses) => {
  if ((!dbDog.death_date && payload.dateOfDeath) ||
      (!dbDog.exported_date && payload.dateExported) ||
      (!dbDog.stolen_date && payload.dateStolen) ||
      (!dbDog.untraceable_date && payload.dateUntraceable)) {
    dbDog.status_id = statuses.filter(x => x.status === constants.statuses.Inactive)[0].id
  } else {
    dbDog.status_id = payload.status ? statuses.filter(x => x.status === payload.status)[0].id : dbDog.status_id
  }
}

const getDogByIndexNumber = async (indexNumber, t) => {
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
    }],
    transaction: t
  })

  return dog
}

const getAllDogIds = async () => {
  return sequelize.models.dog.findAll({ attributes: ['id'] })
}

const deleteDogByIndexNumber = async (indexNumber, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => deleteDogByIndexNumber(indexNumber, user, t))
  }

  const dogAggregate = await sequelize.models.dog.findOne({
    where: { index_number: indexNumber },
    include: [
      {
        model: sequelize.models.registered_person,
        as: 'registered_person'
      },
      {
        model: sequelize.models.dog_microchip,
        as: 'dog_microchips',
        include: [
          {
            model: sequelize.models.microchip,
            as: 'microchip'
          }
        ]
      },
      {
        model: sequelize.models.registration,
        as: 'registration'
      }
    ],
    transaction
  })

  await removeDogFromSearchIndex(dogAggregate, transaction)

  for (const dogMicrochip of dogAggregate.dog_microchips) {
    await dogMicrochip.microchip.destroy()
    await dogMicrochip.destroy()
  }

  for (const registeredPerson of dogAggregate.registered_person) {
    await registeredPerson.destroy()
  }

  await dogAggregate.registration.destroy()

  await dogAggregate.destroy()

  await sendDeleteToAudit(DOG, dogAggregate, user)
}

module.exports = {
  getBreeds,
  getStatuses,
  createDogs,
  addImportedDog,
  updateDog,
  getAllDogIds,
  getDogByIndexNumber,
  updateDogFields,
  updateMicrochips,
  updateStatus,
  deleteDogByIndexNumber
}
