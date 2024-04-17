const sequelize = require('../config/db')
const { dbFindByPk } = require('../lib/db-functions')
const { buildAddressString } = require('../lib/address-helper')
const { getMicrochip } = require('../dto/dto-helper')
const { personRelationship } = require('./relationships/person')

const addToSearchIndex = async (person, dog, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => addToSearchIndex(person, dog, t))
  }

  if (dog.existingDog) {
    await sequelize.models.search_index.destroy({ where: { dog_id: dog.id } }, { transaction })
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

  await sequelize.models.search_index.create({
    search: buildIndexColumn(person, refreshedDogEntity),
    person_id: person.id,
    dog_id: dog.id,
    json: buildJsonColumn(person, refreshedDogEntity)
  }, { transaction })
}

const buildIndexColumn = (person, dog) => {
  const address = person?.addresses?.address ? person.addresses.address : person.address
  return sequelize.fn('to_tsvector', `${person.person_reference} ${person.first_name} ${person.last_name} ${person.organisation_name ? person.organisation_name : ''} ${buildAddressString(address, true)} ${dog.index_number} ${dog.name ? dog.name : ''} ${dog.microchip_number ? dog.microchip_number : ''} ${dog.microchip_number2 ? dog.microchip_number2 : ''}`)
}

const buildJsonColumn = (person, dog) => {
  return {
    firstName: person.first_name,
    lastName: person.last_name,
    organisationName: person.organisation_name,
    address: buildAddressObject(person),
    dogIndex: dog.index_number,
    dogName: dog.name,
    dogStatus: dog.status?.status ?? dog.status,
    microchipNumber: dog.microchip_number,
    microchipNumber2: dog.microchip_number2,
    personReference: person.person_reference
  }
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

  const indexRows = await sequelize.models.search_index.findAll({
    where: { dog_id: dogFromDb.id },
    transaction
  })

  // update
  for (const indexRow of indexRows) {
    await indexRow.destroy()
  }
}

const updateSearchIndexDog = async (dogFromDb, statuses, transaction) => {
  const indexRows = await sequelize.models.search_index.findAll({
    where: { dog_id: dogFromDb.id },
    transaction
  })

  for (const indexRow of indexRows) {
    const partialPerson = {
      person_reference: indexRow.json.personReference,
      first_name: indexRow.json.firstName,
      last_name: indexRow.json.lastName,
      address: indexRow.json.address,
      organisation_name: indexRow.json.organisationName
    }
    const partialDog = {
      index_number: dogFromDb.index_number,
      name: dogFromDb.name,
      status: dogFromDb.status?.status ?? indexRow.json.dogStatus,
      microchip_number: getMicrochip(dogFromDb, 1),
      microchip_number2: getMicrochip(dogFromDb, 2)
    }
    indexRow.search = buildIndexColumn(partialPerson, partialDog)
    indexRow.json = buildJsonColumn(partialPerson, partialDog)
    await indexRow.save({ transaction })
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
        indexRow.json.address.address_line_1 !== person.address.addressLine1 ||
        indexRow.json.address.address_line_2 !== person.address.addressLine2 ||
        indexRow.json.address.town !== person.address.town ||
        indexRow.json.address.postcode !== person.address.postcode ||
        indexRow.json.organisationName !== person.organisationName) {
      const partialPerson = {
        person_reference: person.personReference,
        first_name: person.firstName,
        last_name: person.lastName,
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
    }
  }
}

module.exports = {
  addToSearchIndex,
  buildAddressString,
  removeDogFromSearchIndex,
  updateSearchIndexDog,
  updateSearchIndexPerson,
  applyMicrochips
}
