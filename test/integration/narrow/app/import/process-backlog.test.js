jest.mock('../../../../../app/import/access/backlog/backlog-functions')
const { buildDog, buildPerson, warmUpCache, isPersonValid, insertPerson, isDogValid, insertDog, getBacklogRows, createRegistration, isRegistrationValid, lookupPersonIdByRef, addComment } = require('../../../../../app/import/access/backlog/backlog-functions')
jest.mock('../../../../../app/lib/db-functions')
const { dbLogErrorToBacklog } = require('../../../../../app/lib/db-functions')
jest.mock('../../../../../app/lookups')
const { addToSearchIndex } = require('../../../../../app/repos/search')
jest.mock('../../../../../app/repos/search')
const { testBacklogPerson } = require('./persons')
const { testBacklogDog } = require('./dogs')
const backlogRows = require('./mock-backlog-rows')
const { process } = require('../../../../../app/import/access/backlog/process-backlog')

describe('ProcessBacklog test', () => {
  test('Should return zero stats when no rows', async () => {
    warmUpCache.mockResolvedValue()
    buildPerson.mockReturnValue(testBacklogPerson)
    isPersonValid.mockResolvedValue(true)
    insertPerson.mockResolvedValue('REF1')
    buildDog.mockReturnValue(testBacklogDog)
    isDogValid.mockResolvedValue(true)
    insertDog.mockResolvedValue()
    dbLogErrorToBacklog.mockResolvedValue()
    getBacklogRows.mockResolvedValue([])
    const res = await process({})
    expect(res.stats).not.toBe(null)
    expect(res.stats.rowsProcessed).toBe(0)
    expect(res.stats.rowsInError).toBe(0)
  })

  test('Main loop should run without errors', async () => {
    warmUpCache.mockResolvedValue(null)
    buildPerson.mockReturnValue(testBacklogPerson)
    isPersonValid.mockResolvedValue(true)
    insertPerson.mockResolvedValue('REF1')
    buildDog.mockReturnValue(testBacklogDog)
    isDogValid.mockResolvedValue(true)
    insertDog.mockResolvedValue(123)
    dbLogErrorToBacklog.mockResolvedValue()
    isRegistrationValid.mockResolvedValue(true)
    createRegistration.mockResolvedValue(999)
    addComment.mockResolvedValue()
    getBacklogRows.mockResolvedValue(backlogRows)
    lookupPersonIdByRef.mockResolvedValue({ id: 12345, firstName: 'John', lastName: 'Smith' })
    addToSearchIndex.mockResolvedValue()
    const res = await process({})
    expect(res.stats).not.toBe(null)
    expect(res.stats.rowsProcessed).toBe(2)
    expect(res.stats.rowsInError).toBe(0)
    expect(res.stats.dogRowsIntoDb).toBe(2)
  })

  test('Should log error when inserting invalid dog', async () => {
    warmUpCache.mockResolvedValue(null)
    buildPerson.mockReturnValue(testBacklogPerson)
    isPersonValid.mockResolvedValue(true)
    insertPerson.mockResolvedValue('REF1')
    buildDog.mockReturnValue(testBacklogDog)
    isDogValid.mockResolvedValue(false)
    insertDog.mockResolvedValue()
    dbLogErrorToBacklog.mockResolvedValue()
    getBacklogRows.mockResolvedValue(backlogRows)
    const res = await process({})
    expect(res.stats).not.toBe(null)
    expect(res.stats.rowsProcessed).toBe(2)
    expect(res.stats.rowsInError).toBe(2)
    expect(res.stats.dogRowsIntoDb).toBe(0)
  })

  test('Should log error when inserting invalid person', async () => {
    warmUpCache.mockResolvedValue(null)
    buildPerson.mockReturnValue(testBacklogPerson)
    isPersonValid.mockResolvedValue(false)
    insertPerson.mockResolvedValue('REF1')
    buildDog.mockReturnValue(testBacklogDog)
    isDogValid.mockResolvedValue(true)
    insertDog.mockResolvedValue()
    dbLogErrorToBacklog.mockResolvedValue()
    getBacklogRows.mockResolvedValue(backlogRows)
    const res = await process({})
    expect(res.stats).not.toBe(null)
    expect(res.stats.rowsProcessed).toBe(2)
    expect(res.stats.rowsInError).toBe(2)
    expect(res.stats.dogRowsIntoDb).toBe(0)
  })

  test('Should log error when exception thrown', async () => {
    warmUpCache.mockResolvedValue(null)
    buildPerson.mockImplementation(() => { throw new Error('dummy error') })
    isPersonValid.mockResolvedValue(true)
    insertPerson.mockResolvedValue('REF1')
    buildDog.mockReturnValue(testBacklogDog)
    isDogValid.mockResolvedValue(true)
    insertDog.mockResolvedValue()
    dbLogErrorToBacklog.mockResolvedValue()
    getBacklogRows.mockResolvedValue(backlogRows)
    const res = await process({})
    expect(res.stats).not.toBe(null)
    expect(res.stats.rowsProcessed).toBe(2)
    expect(res.stats.rowsInError).toBe(2)
    expect(res.stats.dogRowsIntoDb).toBe(0)
  })
})
