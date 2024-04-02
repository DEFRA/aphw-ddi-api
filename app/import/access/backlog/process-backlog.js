const PersonCache = require('../person-cache')
const { buildDog, buildPerson, warmUpCache, isPersonValid, insertPerson, isDogValid, insertDog, getBacklogRows, lookupPersonIdByRef, isRegistrationValid, createRegistration, addComment } = require('./backlog-functions')
const { dbLogErrorToBacklog } = require('../../../lib/db-functions')
const { cleanseRow } = require('./cleanse-backlog.js')
const { addToSearchIndex } = require('../../../repos/search')

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
            await addToSearchIndex(rereadPerson, dog)
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

module.exports = {
  process
}
