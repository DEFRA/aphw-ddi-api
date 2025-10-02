const sequelize = require('../../config/db')
const { Op } = require('sequelize')
const { v4: uuidv4 } = require('uuid')
const constants = require('../../constants/statuses')
const { getBreed, getExemptionOrder } = require('../../lookups')
const { updateSearchIndexDog } = require('../search-index')
const { updateMicrochips, createMicrochip } = require('../microchip')
const { createInsurance } = require('../insurance')
const { sendCreateToAudit, sendUpdateToAudit, sendDeleteToAudit, sendPermanentDeleteToAudit } = require('../../messaging/send-audit')
const { DOG } = require('../../constants/event/audit-event-object-types')
const { preChangedDogAudit, postChangedDogAudit } = require('../../dto/auditing/dog')
const { removeDogFromSearchIndex } = require('../search-index')
const { getPersonByReference } = require('../people')
const { addYears } = require('../../lib/date-helpers')
const { extractEmail } = require('../../dto/dto-helper')
const { setBreaches } = require('../breaches')
const { mapDogDaoToDog } = require('../mappers/cdo')

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
 * @property {DogBreachDao[]} dog_breaches
 * @property {Function} save
 * @property {Function} destroy
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
    console.error('Error retrieving dog breeds:', err)
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
    console.error('Error retrieving statuses:', err)
    throw err
  }
}

/**
 * @return {(function(): Promise<*|Model<any, TModelAttributes>[]>)|*}
 */
const cachedStatuses = () => {
  let _statuses

  return async () => {
    if (_statuses !== undefined) {
      return _statuses
    }
    _statuses = await getStatuses()

    return _statuses
  }
}

const getCachedStatuses = cachedStatuses()

const determineExemptionOrder = (dog, owners) => {
  const isScotland = owners.some(owner => owner.address.country.country === 'Scotland')

  if (isScotland) {
    if (dog.breed === 'XL Bully') {
      throw new Error('XL Bully cannot be in Scotland')
    } else {
      return '1991'
    }
  }

  return dog.source === 'ROBOT' ? '2023' : '2015'
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

      const exemptionOrderNumber = determineExemptionOrder(dog, owners)
      const exemptionOrder = await getExemptionOrder(exemptionOrderNumber)

      dog.resetInsurance = exemptionOrderNumber === '2015' && existingDog && dogEntity.registration?.exemption_order?.exemption_order === '2023'

      const registrationEntity = await createRegistration(dogEntity, dog, enforcement, exemptionOrder, transaction)

      const createdRegistration = await refreshRegistrationData(registrationEntity.id, transaction)

      await handleInsuranceAndMicrochipAndRegPerson(dogEntity, dog, dogResult, owners, transaction)

      createdDogs.push({ ...dogResult, registration: createdRegistration })
    }

    return createdDogs
  } catch (err) {
    console.error('Error creating dog:', err)
    throw err
  }
}

const buildSwitchedOwner = async (owner) => {
  const ownerInfo = await getPersonByReference(owner.person_reference)
  return {
    id: owner.id,
    personReference: owner.person_reference,
    firstName: owner.first_name,
    lastName: owner.last_name,
    address: owner.addresses ? owner.addresses[0].address : owner.address,
    organisationName: ownerInfo?.organisation?.organisation_name,
    email: extractEmail(ownerInfo?.person_contacts)
  }
}

const switchOwnerIfNecessary = async (dogAndOwner, newOwners, dogResult, transaction) => {
  const currentOwner = dogAndOwner.registered_person[0].person
  const newOwner = newOwners[0]
  if (currentOwner.person_reference !== newOwner.person_reference) {
    const reg = await sequelize.models.registered_person.findOne({
      where: {
        dog_id: dogAndOwner.id
      }
    })
    reg.person_id = newOwner.id
    await reg.save({ transaction })

    dogResult.changedOwner = {
      oldOwner: await buildSwitchedOwner(currentOwner),
      newOwner: await buildSwitchedOwner(newOwner)
    }
  }

  return dogResult
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
  } else {
    dogResult = await switchOwnerIfNecessary(dogEntity, owners, dogResult, transaction)
    if (dog.resetInsurance) {
      await sequelize.models.insurance.destroy({
        where: {
          dog_id: dogEntity.id
        },
        transaction
      })
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
    await sequelize.models.dog_breach.destroy({
      where: { dog_id: dogEntity.id },
      transaction,
      force: true
    })
  }

  const timestamp = new Date()

  const insuranceDetailsRecorded = dogEntity?.registration?.insurance_details_recorded

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
    neutering_deadline: dog.neuteringDeadline,
    microchip_number_recorded: dog.microchipNumber ? timestamp : null,
    insurance_details_recorded: insuranceDetailsRecorded || null,
    application_fee_payment_recorded: dog.applicationFeePaid ? timestamp : null
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

  await updateBreaches(dogFromDB, statuses, transaction)

  await updateMicrochips(dogFromDB, payload, transaction)

  await dogFromDB.save({ transaction })

  const refreshedDog = await getDogByIndexNumber(payload.indexNumber, transaction)

  await updateSearchIndexDog(refreshedDog, transaction)

  await sendUpdateToAudit(DOG, preChangedDog, postChangedDogAudit(refreshedDog), user)

  return dogFromDB
}

const updateBreaches = async (dog, statuses, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => updateBreaches(dog, statuses, t))
  }

  if (dog.status_id !== statuses.find(x => x.status === constants.statuses.InBreach).id) {
    for (const dogBreach of dog.dog_breaches) {
      await dogBreach.destroy({ force: true, transaction })
    }
  }

  dog.dog_breaches = []
}

/**
 * @param {DogDao} dogFromDB
 * @param newStatus
 * @param transaction
 * @return {Promise<void>}s
 */
const updateDogStatus = async (dogFromDB, newStatus, transaction) => {
  const statuses = await getCachedStatuses()
  dogFromDB.status_id = statuses.filter(x => x.status === newStatus)[0].id

  await updateBreaches(dogFromDB, statuses, transaction)

  await dogFromDB.save({ transaction })

  const refreshedDog = await getDogByIndexNumber(dogFromDB.index_number, transaction)

  await updateSearchIndexDog(refreshedDog, transaction)
}

const updateStatus = async (indexNumber, newStatus, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => updateStatus(indexNumber, newStatus, t))
  }

  const dogFromDB = await getDogByIndexNumber(indexNumber, transaction)

  await updateDogStatus(dogFromDB, newStatus, transaction)

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
  if (payload.status === 'Insurance Spot Check') {
    dbDog.insurance_spotcheck_date = new Date()
  }
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

/**
 * @param {string} indexNumber
 * @param t
 * @return {Promise<DogDao>}
 */
const getDogByIndexNumber = async (indexNumber, t) => {
  const dog = await sequelize.models.dog.findOne({
    where: { index_number: indexNumber },
    include: [
      {
        model: sequelize.models.registration,
        as: 'registration',
        include: [{
          model: sequelize.models.exemption_order,
          as: 'exemption_order'
        }]
      },
      {
        model: sequelize.models.registered_person,
        as: 'registered_person',
        include: [
          {
            model: sequelize.models.person,
            as: 'person',
            include: [
              {
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
                separate: true, // workaround to prevent 'contact_type_id' being truncated to 'contact_type_i'
                include: [{
                  model: sequelize.models.contact,
                  as: 'contact',
                  include: [{
                    model: sequelize.models.contact_type,
                    as: 'contact_type'
                  }]
                }]
              }
            ]
          },
          {
            model: sequelize.models.person_type,
            as: 'person_type'
          }
        ]
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
      },
      {
        model: sequelize.models.dog_breach,
        as: 'dog_breaches',
        include: [{
          model: sequelize.models.breach_category,
          as: 'breach_category'
        }]
      }
    ],
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
      },
      {
        model: sequelize.models.insurance,
        as: 'insurance'
      },
      {
        model: sequelize.models.dog_breach,
        as: 'dog_breaches'
      }
    ],
    transaction
  })

  await removeDogFromSearchIndex(dogAggregate, transaction)

  for (const dogMicrochip of dogAggregate.dog_microchips) {
    await dogMicrochip.microchip.destroy()
    await dogMicrochip.destroy()
  }

  for (const insuranceRecord of dogAggregate.insurance) {
    await insuranceRecord.destroy()
  }

  for (const registeredPerson of dogAggregate.registered_person) {
    await registeredPerson.destroy()
  }

  for (const dogBreach of dogAggregate.dog_breaches) {
    await dogBreach.destroy()
  }

  await dogAggregate.registration.destroy()

  await dogAggregate.destroy()

  await sendDeleteToAudit(DOG, dogAggregate, user)
}

const purgeDogByIndexNumber = async (indexNumber, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => purgeDogByIndexNumber(indexNumber, user, t))
  }

  const dogAggregate = await sequelize.models.dog.findOne({
    where: { index_number: indexNumber },
    include: [
      {
        model: sequelize.models.registration,
        as: 'registrations',
        paranoid: false,
        include: [
          {
            model: sequelize.models.form_two,
            as: 'form_two'
          }
        ]
      },
      {
        model: sequelize.models.registered_person,
        as: 'registered_person',
        paranoid: false
      },
      {
        model: sequelize.models.dog_microchip,
        as: 'dog_microchips',
        paranoid: false,
        include: [
          {
            model: sequelize.models.microchip,
            as: 'microchip',
            paranoid: false
          }
        ]
      },
      {
        model: sequelize.models.insurance,
        as: 'insurance',
        paranoid: false
      },
      {
        model: sequelize.models.dog_breach,
        as: 'dog_breaches',
        paranoid: false
      }
    ],
    transaction,
    paranoid: false
  })

  for (const dogMicrochip of dogAggregate.dog_microchips) {
    await dogMicrochip.destroy({ force: true, transaction })
    await dogMicrochip.microchip.destroy({ force: true, transaction })
  }

  for (const insurance of dogAggregate.insurance) {
    await insurance.destroy({ force: true, transaction })
  }

  for (const registeredPerson of dogAggregate.registered_person) {
    await registeredPerson.destroy({ force: true, transaction })
  }

  for (const registration of dogAggregate.registrations) {
    if (registration.form_two !== null) {
      await registration.form_two.destroy({ force: true, transaction })
    }
    await registration.destroy({ force: true, transaction })
  }

  for (const dogBreach of dogAggregate.dog_breaches) {
    await dogBreach.destroy({ force: true, transaction })
  }

  await sequelize.models.search_tgram.destroy({
    where: {
      dog_id: dogAggregate.id
    },
    force: true,
    transaction
  })

  await dogAggregate.destroy({ force: true, transaction })

  await sendPermanentDeleteToAudit(DOG, dogAggregate, user)
}

const customSort = (columnName, ids, sortDir) => {
  const sortElems = []
  const idList = sortDir === 'ASC' ? ids.reverse() : ids
  idList.forEach(id => sortElems.push(`${columnName}=${id}`))
  return sortElems.join(',')
}

const constructDbSort = (options, statusIds) => {
  const sortDir = options?.sortOrder ?? 'ASC'
  const order = []
  const sortKey = options?.sortKey ?? 'status'

  if (sortKey === 'status') {
    order.push([sequelize.literal(customSort('dog.status_id', statusIds, sortDir)), 'ASC'])
    order.push([sequelize.col('dog.index_number'), sortDir])
  } else if (sortKey === 'indexNumber') {
    order.push([sequelize.col('dog.index_number'), sortDir])
  } else if (sortKey === 'dateOfBirth') {
    order.push([sequelize.col('dog.birth_date'), sortDir])
  } else if (sortKey === 'cdoIssued') {
    order.push([sequelize.col('cdo_issued'), sortDir])
  } else if (sortKey === 'selected') {
    order.push([sequelize.col('dog.index_number'), 'ASC'])
  }
  return order
}

const constructStatusList = async statusNamesCsvList => {
  const statuses = await getStatuses()
  const statusIds = []
  const statusNames = statusNamesCsvList?.split(',') ?? []
  statusNames.forEach(name => statusIds.push(statuses.find(st => st.status === name).id))
  return statusIds
}

const generateClausesForOr = (today, fifteenYearsAgo, endDate2023Dogs) => {
  const clausesForOr = [
    { '$dog.birth_date$': { [Op.lte]: fifteenYearsAgo } },
    {
      [Op.and]: [
        { '$dog.birth_date$': { [Op.eq]: null } },
        { cdo_issued: { [Op.lte]: fifteenYearsAgo } }
      ]
    }
  ]

  if (today > endDate2023Dogs) {
    clausesForOr.push({
      [Op.and]: [
        { '$dog.birth_date$': { [Op.eq]: null } },
        { '$exemption_order.exemption_order$': '2023' }
      ]
    })
  }

  return clausesForOr
}
const getOldDogs = async (statusList, sortOptions, today = null) => {
  today = today ?? new Date()
  const fifteenYearsAgo = addYears(today, -15)
  const endDate2023Dogs = new Date(2038, 2, 1)

  const statusIds = await constructStatusList(statusList)

  const order = constructDbSort(sortOptions, statusIds)

  const clausesForOr = generateClausesForOr(today, fifteenYearsAgo, endDate2023Dogs)

  return sequelize.models.registration.findAll({
    attributes: ['dog_id', 'cdo_issued'],
    where: {
      [Op.and]: [
        { [Op.or]: clausesForOr },
        { '$dog.status_id$': { [Op.in]: statusIds } }
      ]
    },
    order,
    include: [{
      model: sequelize.models.dog,
      as: 'dog',
      attributes: ['index_number', 'birth_date'],
      include: [{
        model: sequelize.models.status,
        as: 'status',
        attributes: ['status']
      }]
    },
    {
      model: sequelize.models.exemption_order,
      as: 'exemption_order'
    }]
  })
}

const saveDogFields = async (dog, dogDao, transaction) => {
  const updates = dog.getChanges()

  for (const update of updates) {
    if (update.key === 'status') {
      await updateDogStatus(dogDao, update.value, transaction)
    } else if (update.key === 'dogBreaches') {
      await setBreaches(dog, dogDao, transaction)
    } else {
      throw new Error('Not implemented')
    }

    // this will publish the event
    if (update.callback) {
      await update.callback()
    }
  }
}
/**
 * @param {import('../../data/domain/exemption')} exemption
 * @param registrationDao
 * @param [transaction]
 * @return {Promise<undefined>}
 */
const saveDogExemption = async (exemption, registrationDao, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => saveDogExemption(exemption, registrationDao, t))
  }

  const updates = exemption.getChanges()

  for (const update of updates) {
    if (update.key === 'withdrawn') {
      registrationDao.withdrawn = update.value
      await registrationDao.save({ transaction })
    } else if (update.key !== 'callback') {
      throw new Error('Not implemented')
    }

    if (update.callback) {
      await update.callback()
    }
  }
}
/**
 * @param {import('../../data/domain/dog')} dog
 * @param {Function} [callBack]
 * @param [transaction]
 * @return {Promise<*|undefined>}
 */
const saveDog = async (dog, callBack, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => saveDog(dog, callBack, t))
  }

  const dogDao = await getDogByIndexNumber(dog.indexNumber, transaction)

  if (dog.exemption?.getChanges().length) {
    await saveDogExemption(dog.exemption, dogDao.registration, transaction)
  }

  await saveDogFields(dog, dogDao, transaction)

  if (callBack) {
    await callBack()
  }
}

/**
 * @param {string} indexNumber
 * @param t
 * @return {Promise<Dog|undefined>}
 */
const getDogModel = async (indexNumber, t) => {
  const dogDao = await getDogByIndexNumber(indexNumber, t)
  if (!dogDao) {
    return undefined
  }
  return mapDogDaoToDog(dogDao, true)
}

module.exports = {
  getBreeds,
  getStatuses,
  getCachedStatuses,
  saveDogExemption,
  createDogs,
  addImportedDog,
  updateDog,
  getAllDogIds,
  getDogByIndexNumber,
  updateDogFields,
  updateMicrochips,
  updateBreaches,
  updateStatus,
  deleteDogByIndexNumber,
  purgeDogByIndexNumber,
  switchOwnerIfNecessary,
  buildSwitchedOwner,
  getOldDogs,
  constructStatusList,
  constructDbSort,
  generateClausesForOr,
  customSort,
  saveDog,
  saveDogFields,
  getDogModel,
  determineExemptionOrder
}
