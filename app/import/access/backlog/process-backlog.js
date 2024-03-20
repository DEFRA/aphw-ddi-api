const PersonCache = require('../person-cache')
const { buildDog, buildPerson, warmUpCache, isPersonValid, insertPerson, isDogValid, insertDog, getBacklogRows, lookupPersonIdByRef, isRegistrationValid, createRegistration, addComment } = require('./backlog-functions')
const { dbLogErrorToBacklog } = require('../../../lib/db-functions')
const { cleanseRow } = require('./cleanse-backlog.js')
const { addToSearchIndex } = require('../../../repos/search')
const { differenceInYears } = require('date-fns')

let stats

const process = async (config) => {
  config.maxRecords = config.maxRecords || 99999
  stats = {
    rowsProcessed: 0,
    rowsInError: 0,
    dogRowsIntoDb: 0,
    peopleRowsIntoDb: 0
  }

  const backlogRows = await getBacklogRows(config.maxRecords)

  if (backlogRows.length === 0) {
    return { stats }
  }

  const personCache = new PersonCache(config)
  await warmUpCache(personCache)

  // Create records in DB from backlog data
  for (const backlogRow of backlogRows) {
    stats.rowsProcessed++
    try {
      const jsonObj = await cleanseRow(backlogRow)

      // Create person first. Dog object then holds a link to newly-created person
      // so linkage can be achieved
      const person = buildPerson(jsonObj)
      const dog = buildDog(jsonObj)
      if (await isPersonValid(person, backlogRow) && await isDogValid(dog, backlogRow) && await isRegistrationValid(jsonObj, backlogRow)) {
        if (!config.validateOnly) {
          const createdPersonRef = await insertPerson(person, backlogRow, personCache)
          stats.peopleRowsIntoDb = stats.peopleRowsIntoDb + (backlogRow.status === 'PROCESSED_NEW_PERSON' ? 1 : 0)
          if (createdPersonRef) {
            const rereadPerson = await lookupPersonIdByRef(createdPersonRef)
            dog.owner = rereadPerson.id
            const dogId = await insertDog(dog, backlogRow)
            const regId = await createRegistration(dogId, 1, jsonObj)
            if (jsonObj.comments) {
              await addComment(jsonObj.comments, regId)
            }
            dog.id = dogId
            await addToSearchIndex(rereadPerson, dog.id)
            stats.dogRowsIntoDb++
          }
        }
      } else {
        stats.rowsInError++
      }
    } catch (e) {
      console.log(e)
      await dbLogErrorToBacklog(backlogRow, [{ error: `${e} ${e?.parent} ${e?.parent?.detail}` }])
      stats.rowsInError++
    }
  }

  return { stats }
}

const today = new Date()

const listDuplicates = async (config) => {
  config.maxRecords = config.maxRecords || 99999
  stats = {
    rowsProcessed: 0,
    rowsInError: 0,
    dogRowsIntoDb: 0,
    peopleRowsIntoDb: 0
  }

  const backlogRows = await getBacklogRows(config.maxRecords)

  if (backlogRows.length === 0) {
    return { stats }
  }

  const personCache = new PersonCache(config)

  const duplicates = []

  for (const backlogRow of backlogRows) {
    try {
      const jsonObj = await cleanseRow(backlogRow)

      if (isExcludedRecord(jsonObj)) {
        continue
      }

      stats.rowsProcessed++

      const person = buildPerson(jsonObj)
      if (await isPersonValid(person, backlogRow)) {
        personCache.addMatchCodes(person)
        const existingPersonRef = personCache.getPersonRefIfAlreadyExists(person)
        if (!existingPersonRef) {
          personCache.addPerson(person)
        } else {
          duplicates.push(person)
        }
      }
    } catch (e) {
      console.log(e)
      await dbLogErrorToBacklog(backlogRow, [{ error: `${e} ${e?.parent} ${e?.parent?.detail}` }])
      stats.rowsInError++
    }
  }

  for (const duplicate of duplicates.sort((a, b) => parseInt(a.person_reference) - parseInt(b.person_reference))) {
    const person = personCache.getPerson(duplicate)
    console.log('Duplicate from cache1 person_reference:', person.person_reference)
    console.log(`Duplicate found:      ${duplicate.person_reference} ${duplicate.first_name} ${duplicate.last_name} ${duplicate.address?.address_line_1} ${duplicate.address?.postcode}`)
    console.log(`Duplicate from cache: ${person.person_reference} ${person.first_name} ${person.last_name} ${person.address?.address_line_1} ${person.address?.postcode}`)
  }

  console.log('duplicate count', duplicates.length)

  console.log('config', config)

  return { stats }
}

const isExcludedRecord = jsonObj => {
  if (jsonObj.status !== 'Certificate Issued' &&
    jsonObj.status !== 'Insurance Expired' &&
    jsonObj.status !== 'Work in Progress') {
    return true
  }

  const dob = jsonObj.dogDateOfBirth || jsonObj.notificationDate
  if (differenceInYears(today, new Date(dob), { locale: 'enGB' }) > 15) {
    return true
  }

  if (jsonObj.breed !== 'Pit Bull Terrier' &&
    jsonObj.breed !== 'Dogo Argentino' &&
    jsonObj.breed !== 'Japanese Tosa' &&
    jsonObj.breed !== 'Fila Brasileiro') {
    return true
  }

  return false
}

module.exports = {
  process,
  listDuplicates
}
