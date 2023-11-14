const sequelize = require('../config/db')
const { v4: uuidv4 } = require('uuid')
const { getBreed } = require('../lookups')
const { getMicrochipType } = require('../lookups')

const buildDog = async (jsonObj, personRef) => ({
  dog_reference: uuidv4(),
  orig_index_number: jsonObj.dogIndexNumber,
  name: jsonObj.dogName,
  breed: jsonObj.breed,
  status_id: 1,
  birth_date: jsonObj.dogDateOfBirth,
  tattoo: jsonObj.tattoo,
  microchip_type: jsonObj.microchipType,
  microchip_number: jsonObj.microchipNumber,
  colour: jsonObj.colour,
  sex: jsonObj.sex,
  exported: jsonObj?.dogExported === 'Yes',
  owner: await lookupPersonIdByRef(personRef)
})

const lookupPersonIdByRef = async (ref) => {
  return (await sequelize.models.person.findOne({ where: { person_reference: ref } })).id
}

const getBreedIfValid = async (jsonObj) => {
  const breed = await getBreed(jsonObj.breed)
  if (breed) {
    return breed.id
  }
  throw new Error(`Invalid breed: ${jsonObj.breed}`)
}

const getMicrochipTypeIfValid = async (jsonObj) => {
  if (!jsonObj.microchipType) {
    return null
  }
  const microchipType = await getMicrochipType(jsonObj.microchipType)
  if (microchipType) {
    return microchipType.id
  }
  throw new Error(`Invalid microchip type: ${jsonObj.microchipType}`)
}

const buildPerson = (jsonObj) => ({
  title: jsonObj.title,
  first_name: jsonObj.firstName,
  last_name: jsonObj.lastName,
  address: {
    address_line_1: jsonObj.addressLine1,
    address_line_2: jsonObj.addressLine2,
    address_line_3: jsonObj.addressLine3,
    county: jsonObj.county,
    postcode: `${jsonObj.postcodePart1} ${jsonObj.postcodePart2}`,
    country: jsonObj.country
  },
  contacts: buildContacts(jsonObj)
})

const buildContacts = (jsonObj) => {
  const contacts = []
  if (jsonObj.phone1) {
    contacts.push({ type: 'Phone', contact: jsonObj.phone1 })
  }
  if (jsonObj.phone2) {
    contacts.push({ type: 'Phone', contact: jsonObj.phone2 })
  }
  return contacts
}

module.exports = {
  buildDog,
  buildPerson,
  getBreedIfValid,
  getMicrochipTypeIfValid
}
