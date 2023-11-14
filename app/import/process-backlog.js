const sequelize = require('../config/db')
const getMicrochipType = require('../lookups/microchip-type')
const PersonCache = require('./person-cache')
const { buildDog, buildPerson } = require('./backlog-functions')
const importDogSchema = require('./imported-dog-schema')
const importPersonSchema = require('./imported-person-schema')
const addPeople = require('../person/add-person')
const addDog = require('../dog/add-dog')
const { getTitle, getCounty, getCountry, getBreed } = require('../lookups')

let rowsProcessed
let rowsInError
let dogRowsIntoDb
let peopleRowsIntoDb
let rowsLinked

const process = async (config) => {
  config.maxRecords = config.maxRecords || 99999
  rowsProcessed = 0
  rowsInError = 0
  dogRowsIntoDb = 0
  peopleRowsIntoDb = 0
  rowsLinked = 0

  const notSuppliedMicrochipType = (await getMicrochipType('N/A')).id

  const backlogRows = await sequelize.models.backlog.findAll({
    limit: config.maxRecords,
    where: { status: 'IMPORTED' }
  })

  if (backlogRows.length === 0) {
    return { rowsProcessed, rowsInError, dogRowsIntoDb, peopleRowsIntoDb, rowsLinked }
  }

  const personCache = new PersonCache(config)
  await warmUpCache(personCache)

  // Create records in DB from backlog data
  for (let i = 0; i < backlogRows.length; i++) {
    rowsProcessed++
    try {
      const backlogRow = backlogRows[i]
      const jsonObj = backlogRow.dataValues.json

      // Create person first. Dog object then holds a link to newly-created person
      // so linkage can be achieved
      const person = buildPerson(jsonObj)
      const createdPersonRef = await validateAndInsertPerson(person, backlogRow, personCache)
      if (createdPersonRef) {
        const dog = await buildDog(jsonObj, createdPersonRef)
        await validateAndInsertDog(dog, backlogRow, notSuppliedMicrochipType)
      }
    } catch (e) {
      console.log(e)
      await logErrorToBacklog(backlogRows[i], [{ error: `${e.message} ${e.stack}` }])
    }
  }

  return { rowsProcessed, rowsInError, dogRowsIntoDb, peopleRowsIntoDb, rowsLinked }
}

const validateAndInsertDog = async (dog, row, notSuppliedMicrochipType) => {
  // Validate lookups
  if (!await areDogLookupsValid(row, dog)) {
    return
  }
  dog.microchip_number = dog.microchip_type_id === notSuppliedMicrochipType ? 'N/A' : dog.microchip_number
  const validationErrors = importDogSchema.isValidImportedDog(dog)
  if (validationErrors.error !== undefined) {
    await logErrorToBacklog(row, validationErrors.error.details)
  } else {
    // TODO - check if dog already exists - need to confirm criteria to use for this
    await addDog(dog)
    await row.update({ status: row.status + '_AND_DOG', errors: [] })
    dogRowsIntoDb++
    rowsLinked++
  }
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
    await logErrorToBacklog(row, JSON.stringify(lookupErrors))
    return false
  }
  return true
}

const validateAndInsertPerson = async (person, row, cache) => {
  // Validate schema
  const validationErrors = importPersonSchema.isValidImportedPerson(person)
  if (validationErrors.error !== undefined) {
    await logErrorToBacklog(row, validationErrors.error.details)
    return null
  } else {
    // Validate lookups
    if (!await arePersonLookupsValid(row, person)) {
      return null
    }
    // Check if person already exists. If so, just return their person_reference
    cache.addMatchCodes(person)
    const existingPersonRef = cache.getPersonRefIfAlreadyExists(person)
    if (!existingPersonRef) {
      await addPeople([person])
      cache.addPerson(person)
      await row.update({ status: 'PROCESSED_NEW_PERSON', errors: [] })
      peopleRowsIntoDb++
    } else {
      await row.update({ status: 'PROCESSED_EXISTING_PERSON', errors: [] })
    }
  }
  return person.person_reference
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
    await logErrorToBacklog(row, JSON.stringify(lookupErrors))
    return false
  }
  return true
}

const warmUpCache = async (cache) => {
  const personRows = await sequelize.models.person.findAll({
    attributes: ['first_name', 'last_name', 'person_reference']
  })
  cache.prepopulate(personRows)
}

const logErrorToBacklog = async (row, errorObj) => {
  await row.update({ status: 'PROCESSING_ERROR', errors: errorObj })
  rowsInError++
}

module.exports = {
  process
}
