const sequelize = require('../config/db')
const { v4: uuidv4 } = require('uuid')
const getBreed = require('../lookups/dog-breed')
const getMicrochipType = require('../lookups/microchip-type')
const importDogSchema = require('./imported-dog-schema')
const importPersonSchema = require('./imported-person-schema')
const addPeople = require('../person/add-person')
const addDog = require('../dog/add-dog')

let rowsProcessed
let rowsInError
let dogRowsIntoDb
let peopleRowsIntoDb
let rowsLinked

const process = async (maxRecords) => {
  maxRecords = maxRecords || 99999
  rowsProcessed = 0
  rowsInError = 0
  dogRowsIntoDb = 0
  peopleRowsIntoDb = 0
  rowsLinked = 0

  const notSuppliedMicrochipType = (await getMicrochipType('N/A')).id

  const backlogRows = await sequelize.models.backlog.findAll({
    limit: maxRecords,
    where: {
      status: 'IMPORTED'
    }
  })

  if (backlogRows.length === 0) {
    return { rowsProcessed, rowsInError, dogRowsIntoDb, peopleRowsIntoDb, rowsLinked }
  }

  // Create records in DB from backlog data
  for (let i = 0; i < backlogRows.length; i++) {
    rowsProcessed++
    try {
      const jsonObj = backlogRows[i].dataValues.json

      // Create person first. Dog record then holds a link to newly-created person
      // so linkage can be achieved
      const person = buildPerson(jsonObj)
      const createdPersonRef = await validateAndInsertPerson(person, backlogRows[i])
      if (createdPersonRef) {
        const dog = await buildDog(jsonObj, notSuppliedMicrochipType, createdPersonRef)
        dog.microchip_number = dog.microchip_type_id === notSuppliedMicrochipType ? 'N/A' : dog.microchip_number
        await validateAndInsertDog(dog, backlogRows[i])
      }
    } catch (e) {
      console.log(e)
      rowsInError++
      await backlogRows[i].update({ status: 'PROCESSING_ERROR', errors: [{ error: `${e.message} ${e.stack}` }] })
    }
  }

  return { rowsProcessed, rowsInError, dogRowsIntoDb, peopleRowsIntoDb, rowsLinked }
}

const buildDog = async (jsonObj, notSuppliedMicrochipType, personRef) => ({
  dog_reference: uuidv4(),
  orig_index_number: jsonObj.dogIndexNumber,
  name: jsonObj.dogName,
  dog_breed_id: await getBreedIfValid(jsonObj),
  status_id: 1,
  birth_date: jsonObj.dogDateOfBirth,
  tattoo: jsonObj.tattoo,
  microchip_number: jsonObj.microchipNumber,
  microchip_type_id: (await getMicrochipTypeIfValid(jsonObj)) ?? notSuppliedMicrochipType,
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

const validateAndInsertDog = async (dog, row) => {
  const validationErrors = importDogSchema.isValidImportedDog(dog)
  if (validationErrors.error !== undefined) {
    // console.log('dog errors', validationErrors)
    rowsInError++
    await row.update({ status: 'PROCESSING_ERROR', errors: validationErrors.error.details })
  } else {
    // TODO - check if dog already exists
    await addDog(dog)
    await row.update({ status: 'PROCESSED_PERSON_AND_DOG', errors: [] })
    dogRowsIntoDb++
    rowsLinked++
  }
}

const validateAndInsertPerson = async (person, row) => {
  let createdPersonRef
  const validationErrors = importPersonSchema.isValidImportedPerson(person)
  if (validationErrors.error !== undefined) {
    // console.log('person errors', validationErrors)
    rowsInError++
    await row.update({ status: 'PROCESSING_ERROR', errors: validationErrors.error.details })
    return createdPersonRef
  } else {
    // TODO - check if person already exists. If so, just return their person_reference
    createdPersonRef = await addPeople([person])
    await row.update({ status: 'PROCESSED_PERSON', errors: [] })
    peopleRowsIntoDb++
  }
  return createdPersonRef[0]
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
  process
}
