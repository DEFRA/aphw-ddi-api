const sequelize = require('../config/db')
const { dbFindByPk } = require('../lib/db-functions')
const { buildAddressString } = require('../lib/address-helper')

const addToSearchIndex = async (person, dogId, transaction) => {
  if (!transaction) {
    return sequelize.transaction((t) => addToSearchIndex(person, dogId, t))
  }

  const dog = await dbFindByPk(sequelize.models.dog, dogId, { raw: true, nest: true, transaction })

  await sequelize.models.search_index.create({
    search: buildIndexColumn(person, dog),
    person_id: person.id,
    dog_id: dog.id,
    json: buildJsonColumn(person, dog)
  }, { transaction })
}

const buildIndexColumn = (person, dog) => {
  const address = person?.addresses?.address ? person.addresses.address : person.address
  return sequelize.fn('to_tsvector', `${person.person_reference} ${person.first_name} ${person.last_name} ${buildAddressString(address, true)} ${dog.index_number} ${dog.name ? dog.name : ''} ${dog.microchip_number ? dog.microchip_number : ''} ${dog.microchip_number2 ? dog.microchip_number2 : ''}`)
}

const buildJsonColumn = (person, dog) => {
  return {
    firstName: person.first_name,
    lastName: person.last_name,
    address: buildAddressObject(person),
    dogIndex: dog.index_number,
    dogName: dog.name,
    microchipNumber: dog.microchip_number,
    microchipNumber2: dog.microchip_number2,
    personReference: person.person_reference
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

const updateSearchIndexDog = async (dog, transaction) => {
  const indexRows = await sequelize.models.search_index.findAll({
    where: { dog_id: dog.dogId },
    transaction
  })

  for (const indexRow of indexRows) {
    if (indexRow.json.name !== dog.name ||
        indexRow.json.microchipNumber !== dog.microchipNumber ||
        indexRow.json.microchipNumber2 !== dog.microchipNumber2) {
      const partialPerson = {
        person_reference: indexRow.json.personReference,
        first_name: indexRow.json.firstName,
        last_name: indexRow.json.lastName,
        address: indexRow.json.address
      }
      const partialDog = {
        index_number: dog.indexNumber,
        name: dog.name,
        microchip_number: dog.microchipNumber,
        microchip_number2: dog.microchipNumber2
      }
      indexRow.search = buildIndexColumn(partialPerson, partialDog)
      indexRow.json = buildJsonColumn(partialPerson, partialDog)
      await indexRow.save({ transaction })
    }
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
        indexRow.json.address.postcode !== person.address.postcode) {
      const partialPerson = {
        person_reference: person.personReference,
        first_name: person.firstName,
        last_name: person.lastName,
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
        microchip_number2: indexRow.json.microchipNumber2
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
  updateSearchIndexDog,
  updateSearchIndexPerson
}
