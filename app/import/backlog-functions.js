const sequelize = require('../config/db')
const { v4: uuidv4 } = require('uuid')
const importDogSchema = require('./imported-dog-schema')
const importPersonSchema = require('./imported-person-schema')
const { addPeople } = require('../person/add-person')
const addDog = require('../dog/add-dog')
const { getTitle, getCounty, getCountry, getBreed, getMicrochipType } = require('../lookups')
const { dbLogErrorToBacklog, dbFindAll, dbFindOne, dbUpdate } = require('../lib/db-functions')

const getBacklogRows = async (maxRecords) => {
  return await dbFindAll(sequelize.models.backlog, {
    limit: maxRecords,
    where: { status: 'IMPORTED' }
  })
}

const buildDog = (jsonObj) => ({
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
  exported: jsonObj?.dogExported === 'Yes'
})

const lookupPersonIdByRef = async (ref) => {
  return (await dbFindOne(sequelize.models.person, { where: { person_reference: ref } })).id
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

const isDogValid = async (dog, row, notSuppliedMicrochipType) => {
  // Validate lookups
  if (!await areDogLookupsValid(row, dog)) {
    return false
  }
  dog.microchip_number = dog.microchip_type_id === notSuppliedMicrochipType ? 'N/A' : dog.microchip_number
  const validationErrors = importDogSchema.isValidImportedDog(dog)
  if (validationErrors.error !== undefined) {
    await dbLogErrorToBacklog(row, validationErrors.error.details)
    return false
  }
  return true
}

const insertDog = async (dog, row) => {
  // TODO - check if dog already exists - need to confirm criteria to use for this
  await addDog(dog)
  await dbUpdate(row, { status: row.status + '_AND_DOG', errors: [] })
}

const areDogLookupsValid = async (row, dog) => {
  const lookupErrors = []
  const dogBreed = await getBreed(dog.breed)
  if (dogBreed) {
    dog.dog_breed_id = dogBreed.id
    delete dog.breed
  } else {
    lookupErrors.push(`Invalid 'breed' value of '${dog.breed}'`)
  }
  const microchipType = await getMicrochipType(dog.microchip_type)
  if (microchipType) {
    dog.microchip_type_id = microchipType.id
    delete dog.microchip_type
  } else {
    lookupErrors.push(`Invalid 'microchipType' value of '${dog.microchipType}'`)
  }
  if (lookupErrors.length > 0) {
    await dbLogErrorToBacklog(row, JSON.stringify(lookupErrors))
    return false
  }
  return true
}

const isPersonValid = async (person, row) => {
  // Validate schema
  const validationErrors = importPersonSchema.isValidImportedPerson(person)
  if (validationErrors.error !== undefined) {
    await dbLogErrorToBacklog(row, validationErrors.error.details)
    return false
  }

  // Validate lookups
  if (!await arePersonLookupsValid(row, person)) {
    return false
  }
  return true
}

const insertPerson = async (person, row, cache) => {
  // Check if person already exists. If so, just return their person_reference
  cache.addMatchCodes(person)
  const existingPersonRef = cache.getPersonRefIfAlreadyExists(person)
  if (!existingPersonRef) {
    await addPeople([person])
    cache.addPerson(person)
    await dbUpdate(row, { status: 'PROCESSED_NEW_PERSON', errors: [] })
  } else {
    await dbUpdate(row, { status: 'PROCESSED_EXISTING_PERSON', errors: [] })
  }
  return existingPersonRef ?? person.person_reference
}

const arePersonLookupsValid = async (row, person) => {
  const lookupErrors = []
  if ((await getTitle(person.title)) == null) {
    lookupErrors.push(`Invalid 'title' value of '${person.title}'`)
  }
  if ((await getCounty(person.address.county)) == null) {
    lookupErrors.push(`Invalid 'county' value of '${person.address.county}'`)
  }
  if ((await getCountry(person.address.country)) == null) {
    lookupErrors.push(`Invalid 'country' value of '${person.address.country}'`)
  }
  if (lookupErrors.length > 0) {
    await dbLogErrorToBacklog(row, JSON.stringify(lookupErrors))
    return false
  }
  return true
}

const warmUpCache = async (cache) => {
  const personRows = await dbFindAll(sequelize.models.person, {
    attributes: ['first_name', 'last_name', 'person_reference']
  })
  cache.prepopulate(personRows)
}

module.exports = {
  getBacklogRows,
  lookupPersonIdByRef,
  buildDog,
  buildPerson,
  getBreedIfValid,
  getMicrochipTypeIfValid,
  areDogLookupsValid,
  arePersonLookupsValid,
  warmUpCache,
  isDogValid,
  insertDog,
  isPersonValid,
  insertPerson
}
