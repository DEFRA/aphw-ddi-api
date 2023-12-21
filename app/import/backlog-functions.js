const sequelize = require('../config/db')
const { v4: uuidv4 } = require('uuid')
const dayjs = require('dayjs')
const importDogSchema = require('./imported-dog-schema')
const importPersonSchema = require('./imported-person-schema')
const { addPeople } = require('../person/add-person')
const { addImportedDog } = require('../repos/dogs')
const { getCounty, getCountry, getBreed, getPoliceForce } = require('../lookups')
const { dbLogErrorToBacklog, dbLogWarningToBacklog, dbFindAll, dbFindOne, dbUpdate, dbCreate } = require('../lib/db-functions')

const getBacklogRows = async (maxRecords) => {
  // TODO - refine criteria using json attributes
  // e.g. exclude dead dogs where yearOfDead is less than 2003
  // e.g. exclude dogs where insureanceExiryDate is older than 01/01/2010
  // e.g. exclude breedType '
  return await dbFindAll(sequelize.models.backlog, {
    limit: maxRecords,
    where: { status: 'IMPORTED' }
  })
}

const buildDog = (jsonObj) => ({
  dog_reference: uuidv4(),
  id: jsonObj.dogIndexNumber,
  name: jsonObj.dogName,
  breed: jsonObj.breed,
  status_id: 1,
  birth_date: jsonObj.dogDateOfBirth,
  tattoo: jsonObj.tattoo,
  microchip_number: jsonObj.microchipNumber,
  colour: jsonObj.colour,
  sex: jsonObj.sex,
  exported: jsonObj?.dogExported === 'Yes'
})

const lookupPersonIdByRef = async (ref) => {
  return await dbFindOne(sequelize.models.person, {
    where: { person_reference: ref },
    include: [{
      model: sequelize.models.person_address,
      as: 'addresses',
      include: {
        model: sequelize.models.address,
        as: 'address'
      }
    }],
    raw: true,
    nest: true
  })
}

const getBreedIfValid = async (jsonObj) => {
  const breed = await getBreed(jsonObj.breed)
  if (breed) {
    return breed.id
  }
  throw new Error(`Invalid breed: ${jsonObj.breed}`)
}

const buildPerson = (jsonObj) => ({
  first_name: jsonObj.firstName,
  last_name: jsonObj.lastName,
  address: {
    address_line_1: jsonObj.addressLine1,
    address_line_2: jsonObj.addressLine2,
    town: jsonObj.town,
    county: jsonObj.county,
    postcode: `${jsonObj.postcodePart1} ${jsonObj.postcodePart2}`,
    country: jsonObj.country
  },
  contacts: buildContacts(jsonObj),
  birth_date: jsonObj.person_date_of_birth
})

const buildContacts = (jsonObj) => {
  const contacts = []
  if (jsonObj.phone1 && jsonObj.phone1 !== 'No') {
    contacts.push({ type: 'Phone', contact: jsonObj.phone1 })
  }
  if (jsonObj.phone2 && jsonObj.phone2 !== 'No') {
    contacts.push({ type: 'Phone', contact: jsonObj.phone2 })
  }
  if (jsonObj.email && jsonObj.email !== 'No') {
    contacts.push({ type: 'Email', contact: jsonObj.email })
  }
  return contacts
}

const isDogValid = async (dog, row) => {
  // Validate lookups
  if (!await areDogLookupsValid(row, dog)) {
    return false
  }
  const validationErrors = importDogSchema.isValidImportedDog(dog)
  if (validationErrors.error !== undefined) {
    await dbLogErrorToBacklog(row, validationErrors.error.details)
    return false
  }
  return true
}

const insertDog = async (dog, row) => {
  // TODO - check if dog already exists - need to confirm criteria to use for this
  const dogId = await addImportedDog(dog)
  await dbUpdate(row, { status: row.status + '_AND_DOG', errors: '' })
  return dogId
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
  if (dog.microchip_number == null) {
    await dbLogWarningToBacklog(row, 'Microchip number is missing')
  }
  if (dog.tattoo == null) {
    await dbLogWarningToBacklog(row, 'Tatoo is missing')
  }
  if (dog.birth_date == null) {
    await dbLogWarningToBacklog(row, 'Dog DOB is missing')
  }
  if (lookupErrors.length > 0) {
    await dbLogErrorToBacklog(row, lookupErrors)
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
    await dbUpdate(row, { status: 'PROCESSED_NEW_PERSON', errors: '' })
  } else {
    await dbUpdate(row, { status: 'PROCESSED_EXISTING_PERSON', errors: '' })
  }
  return existingPersonRef ?? person.person_reference
}

const arePersonLookupsValid = async (row, person) => {
  const lookupErrors = []
  if ((await getCounty(person.address.county)) == null) {
    await dbLogWarningToBacklog(row, `Invalid 'county' value of '${person.address.county}'`)
  }
  if (person.address.postcode && person.address.postcode.toLowerCase().indexOf('xxx') > -1) {
    await dbLogWarningToBacklog(row, `Invalid 'postcode' value of '${person.address.postcode}'`)
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

const isRegistrationValid = async (jsonObj, row) => {
  const policeForce = await getPoliceForce(jsonObj.policeForce)
  if (policeForce == null) {
    await dbLogErrorToBacklog(row, `Invalid 'policeForce' value of '${jsonObj.policeForce}'`)
    return false
  }
  if (jsonObj.notificationDate === null || jsonObj.notificationDate === undefined) {
    await dbLogErrorToBacklog(row, 'Missing notificationDate')
    return false
  }
  return true
}

const createRegistration = async (dogId, statusId, jsonObj) => {
  const registration = {
    dog_id: dogId,
    police_force_id: (await getPoliceForce(jsonObj.policeForce)).id,
    status_id: statusId,
    cdo_issued: jsonObj.notificationDate,
    cdo_expiry: dayjs(jsonObj.notificationDate).add(2, 'month'),
    court_id: 1
  }
  return (await dbCreate(sequelize.models.registration, registration)).id
}

const addComment = async (comment, registrationId) => {
  return (await dbCreate(sequelize.models.comment, { registration_id: registrationId, comment })).id
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
  areDogLookupsValid,
  arePersonLookupsValid,
  warmUpCache,
  isDogValid,
  insertDog,
  isPersonValid,
  insertPerson,
  createRegistration,
  isRegistrationValid,
  addComment
}
