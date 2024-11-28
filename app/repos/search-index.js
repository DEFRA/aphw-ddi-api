const sequelize = require('../config/db')
const { dbFindByPk } = require('../lib/db-functions')
const { buildAddressString } = require('../lib/address-helper')
const { getMicrochip } = require('../dto/dto-helper')
const { insertTrigramsPerDog, insertTrigramsPerPerson, updateTrigramsPerDogOrPerson } = require('./search-tgrams')
const { insertPersonMatchCodes, updateMatchCodesPerPerson } = require('./search-match-codes')
const { statuses } = require('../constants/statuses')
const { getInactiveSubStatus } = require('../lib/status-helper')

const addToSearchIndex = async (person, dog, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => addToSearchIndex(person, dog, t))
  }

  if (dog.existingDog) {
    await sequelize.models.search_index.destroy({ where: { dog_id: dog.id } }, { transaction })
    await sequelize.models.search_tgram.destroy({ where: { dog_id: dog.id } }, { transaction })

    if (dog.changedOwner) {
      const persons = new Map()
      persons.set(dog.changedOwner.oldOwner.id, dog.changedOwner.oldOwner)
      await addPeopleOnlyIfNoDogsLeft(persons, transaction)
    }
  }

  const refreshedDogEntity = await dbFindByPk(sequelize.models.dog, dog.id, {
    order: [[sequelize.col('dog_microchips.id'), 'ASC']],
    include: [{
      model: sequelize.models.status,
      as: 'status'
    },
    {
      model: sequelize.models.dog_microchip,
      as: 'dog_microchips',
      include: [{
        model: sequelize.models.microchip,
        as: 'microchip'
      }]
    }],
    nest: true,
    transaction
  })

  applyMicrochips(refreshedDogEntity)

  const jsonValues = buildJsonColumn(person, refreshedDogEntity)
  await sequelize.models.search_index.create({
    search: buildIndexColumn(person, refreshedDogEntity),
    person_id: person.id,
    dog_id: dog.id,
    police_force_id: dog.registration.police_force_id,
    json: jsonValues
  }, { transaction })

  await insertTrigramsPerDog({ dog_id: dog.id, json: jsonValues }, transaction)
  await insertTrigramsPerPerson({ person_id: person.id, json: jsonValues }, transaction)
  await insertPersonMatchCodes(person.id, { person_id: person.id, json: jsonValues }, transaction)

  await cleanupPossibleOwnerWithNoDogs(person.id, transaction)
}

const buildIndexColumn = (person, dog) => {
  const address = person?.addresses?.address ? person.addresses.address : person.address
  return sequelize.fn(
    'to_tsvector',
    `${person.person_reference} ${person.first_name} ${person.last_name} ${person.email ? person.email : ''} \
${person.organisation_name ? person.organisation_name : ''} \
${buildAddressString(address, true)} \
${dog.index_number ? dog.index_number : ''} \
${dog.name ? dog.name : ''} \
${dog.microchip_number ? dog.microchip_number : ''} \
${dog.microchip_number2 ? dog.microchip_number2 : ''}`.trim())
}

const buildJsonColumn = (person, dog) => {
  const json = {
    firstName: person.first_name,
    lastName: person.last_name,
    email: person.email,
    organisationName: person.organisation_name,
    address: buildAddressObject(person),
    dogIndex: dog.index_number,
    dogName: dog.name,
    dogStatus: dog.status?.status ?? dog.status,
    microchipNumber: dog.microchip_number,
    microchipNumber2: dog.microchip_number2,
    personReference: person.person_reference
  }

  if (json.dogStatus === statuses.Inactive) {
    json.dogSubStatus = dog.subStatus
  }

  return json
}

const applyMicrochips = (dog) => {
  if (dog.dog_microchips?.length > 0) {
    dog.microchip_number = dog.dog_microchips[0].microchip?.microchip_number
  }
  if (dog.dog_microchips?.length > 1) {
    dog.microchip_number2 = dog.dog_microchips[1].microchip?.microchip_number
  }
}

const buildAddressObject = (person) => {
  const address = person?.addresses?.address ? person.addresses.address : person.address
  return {
    address_line_1: address?.address_line_1,
    address_line_2: address?.address_line_2,
    town: address?.town,
    postcode: address?.postcode
  }
}

const removeDogFromSearchIndex = async (dogFromDb, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => removeDogFromSearchIndex(dogFromDb, t))
  }

  const dogIndexRows = await sequelize.models.search_index.findAll({
    where: { dog_id: dogFromDb.id },
    transaction
  })

  const uniquePersons = new Map()

  await sequelize.models.search_tgram.destroy({ where: { dog_id: dogFromDb.id } }, { transaction })

  for (const indexRow of dogIndexRows) {
    if (!uniquePersons.get(indexRow.person_id)) {
      uniquePersons.set(indexRow.person_id, { json: indexRow.json, policeForceId: indexRow.police_force_id })
    }

    await indexRow.destroy({ transaction })
  }

  await addPeopleOnlyIfNoDogsLeft(uniquePersons, transaction)
}

const addPeopleOnlyIfNoDogsLeft = async (persons, transaction) => {
  const personKeys = persons.keys()

  for (const personId of personKeys) {
    const searchIndexExists = await sequelize.models.search_index.findOne({
      where: { person_id: personId },
      transaction
    })

    if (!searchIndexExists) {
      const personDetails = persons.get(personId)
      const person = personDetails.json

      const partialPerson = {
        first_name: person.firstName,
        last_name: person.lastName,
        email: person.email,
        organisation_name: person.organisationName,
        address: person.address,
        person_reference: person.personReference
      }

      const jsonValues = buildJsonColumn(partialPerson, {})

      await sequelize.models.search_index.create({
        search: buildIndexColumn(partialPerson, {}),
        person_id: personId,
        dog_id: null,
        police_force_id: personDetails.policeForceId,
        json: jsonValues
      }, { transaction })

      await updateMatchCodesPerPerson(personId, { json: partialPerson }, transaction)
      await updateTrigramsPerDogOrPerson(personId, 'person', { json: partialPerson }, transaction)
    }
  }
}

const updateSearchIndexDog = async (dogFromDb, transaction) => {
  const indexRows = await sequelize.models.search_index.findAll({
    where: { dog_id: dogFromDb.id },
    transaction
  })

  for (const indexRow of indexRows) {
    const partialPerson = {
      person_reference: indexRow.json.personReference,
      first_name: indexRow.json.firstName,
      last_name: indexRow.json.lastName,
      email: indexRow.json.email,
      address: indexRow.json.address,
      organisation_name: indexRow.json.organisationName
    }
    const status = dogFromDb.status?.status ?? indexRow.json.dogStatus
    const partialDog = {
      index_number: dogFromDb.index_number,
      name: dogFromDb.name,
      status,
      microchip_number: getMicrochip(dogFromDb, 1),
      microchip_number2: getMicrochip(dogFromDb, 2),
      subStatus: status === statuses.Inactive ? getInactiveSubStatus(dogFromDb) : null
    }
    indexRow.search = buildIndexColumn(partialPerson, partialDog)
    indexRow.json = buildJsonColumn(partialPerson, partialDog)
    await indexRow.save({ transaction })

    await updateTrigramsPerDogOrPerson(dogFromDb.id, 'dog', indexRow, transaction)
  }
}

const updateSearchIndexPerson = async (person, transaction) => {
  const indexRows = await sequelize.models.search_index.findAll({
    where: { person_id: person.id },
    transaction
  })

  for (const indexRow of indexRows) {
    if (indexRow.json.firstName !== person.firstName ||
        indexRow.json.lastName !== person.lastName ||
        indexRow.json.email !== person.email ||
        indexRow.json.address.address_line_1 !== person.address.addressLine1 ||
        indexRow.json.address.address_line_2 !== person.address.addressLine2 ||
        indexRow.json.address.town !== person.address.town ||
        indexRow.json.address.postcode !== person.address.postcode ||
        indexRow.json.organisationName !== person.organisationName) {
      const partialPerson = {
        person_reference: person.personReference,
        first_name: person.firstName,
        last_name: person.lastName,
        email: person.email,
        organisation_name: person.organisationName,
        address: {
          address_line_1: person.address.address_line_1 ?? person.address.addressLine1,
          address_line_2: person.address.address_line_2 ?? person.address.addressLine2,
          town: person.address.town,
          postcode: person.address.postcode
        }
      }
      const partialDog = {
        index_number: indexRow.json.dogIndex,
        name: indexRow.json.dogName,
        microchip_number: indexRow.json.microchipNumber,
        microchip_number2: indexRow.json.microchipNumber2,
        status: indexRow.json.dogStatus
      }
      indexRow.search = buildIndexColumn(partialPerson, partialDog)
      indexRow.json = buildJsonColumn(partialPerson, partialDog)
      await indexRow.save({ transaction })

      await updateMatchCodesPerPerson(person.id, indexRow, transaction)
      await updateTrigramsPerDogOrPerson(person.id, 'person', indexRow, transaction)
    }
  }
}

const updateSearchIndexPolice = async (dogId, oldPoliceForceId, newPoliceForceId, transaction) => {
  if ((oldPoliceForceId ?? -1) === newPoliceForceId) {
    return
  }

  const indexRows = await sequelize.models.search_index.findAll({
    where: { dog_id: dogId },
    transaction
  })

  for (const indexRow of indexRows) {
    indexRow.police_force_id = newPoliceForceId
    await indexRow.save({ transaction })
  }
}

const cleanupPossibleOwnerWithNoDogs = async (personId, transaction) => {
  const personsNoDogs = await sequelize.models.search_index.findAll({
    where: {
      person_id: personId,
      dog_id: null
    },
    transaction
  })

  const uniquePersonIds = []
  if (personsNoDogs) {
    for (const personNoDogs of personsNoDogs) {
      uniquePersonIds.push(personNoDogs.person_id)
      await personNoDogs.destroy({ transaction })
    }
  }

  for (const personId of uniquePersonIds) {
    await sequelize.models.search_tgram.destroy({ where: { person_id: personId } }, { transaction })
    await sequelize.models.search_match_code.destroy({ where: { person_id: personId } }, { transaction })
  }
}

module.exports = {
  addToSearchIndex,
  buildAddressString,
  removeDogFromSearchIndex,
  updateSearchIndexDog,
  updateSearchIndexPerson,
  applyMicrochips,
  cleanupPossibleOwnerWithNoDogs,
  updateSearchIndexPolice
}
