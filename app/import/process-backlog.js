const { getMicrochipType } = require('../lookups')
const PersonCache = require('./person-cache')
const { buildDog, buildPerson, warmUpCache, isPersonValid, insertPerson, isDogValid, insertDog, getBacklogRows, lookupPersonIdByRef } = require('./backlog-functions')
const { dbLogErrorToBacklog } = require('../lib/db-functions')

let rowsProcessed
let rowsInError
let dogRowsIntoDb
let peopleRowsIntoDb

const process = async (config) => {
  config.maxRecords = config.maxRecords || 99999
  rowsProcessed = 0
  rowsInError = 0
  dogRowsIntoDb = 0
  peopleRowsIntoDb = 0

  const notSuppliedMicrochipType = (await getMicrochipType('N/A')).id

  const backlogRows = await getBacklogRows(config.maxRecords)

  if (backlogRows.length === 0) {
    return { rowsProcessed, rowsInError, dogRowsIntoDb, peopleRowsIntoDb }
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
      const dog = buildDog(jsonObj)
      if (await isPersonValid(person, backlogRow) && await isDogValid(dog, backlogRow, notSuppliedMicrochipType)) {
        const createdPersonRef = await insertPerson(person, backlogRow, personCache)
        peopleRowsIntoDb = peopleRowsIntoDb + (backlogRow.status === 'PROCESSED_NEW_PERSON' ? 1 : 0)
        if (createdPersonRef) {
          dog.owner = await lookupPersonIdByRef(createdPersonRef)
          await insertDog(dog, backlogRow)
          dogRowsIntoDb++
        }
      } else {
        rowsInError++
      }
    } catch (e) {
      console.log(e)
      await dbLogErrorToBacklog(backlogRows[i], [{ error: `${e.message} ${e.stack}` }])
      rowsInError++
    }
  }

  return { rowsProcessed, rowsInError, dogRowsIntoDb, peopleRowsIntoDb }
}

module.exports = {
  process
}
