const { getBreedIfValid, buildPerson, areDogLookupsValid, arePersonLookupsValid, getBacklogRows, isDogValid, isPersonValid, insertPerson, insertDog, isRegistrationValid, createRegistration, addComment } = require('../../../../app/import/backlog-functions')
const { personWithAddress } = require('./persons')

jest.mock('../../../../app/lookups')
const { getBreed, getCounty, getCountry, getPoliceForce } = require('../../../../app/lookups')

jest.mock('../../../../app/lib/db-functions')
const { dbLogErrorToBacklog, dbFindAll, dbUpdate, dbCreate } = require('../../../../app/lib/db-functions')

jest.mock('../../../../app/person/add-person')
const { addPeople } = require('../../../../app/person/add-person')

jest.mock('../../../../app/dog/add-dog')
const addDog = require('../../../../app/dog/add-dog')

const PersonCache = require('../../../../app/import/person-cache')

describe('BacklogFunctions test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('getBacklogRows returns rows', async () => {
    dbFindAll.mockResolvedValue([1, 2])
    const res = await getBacklogRows()
    expect(res.length).toBe(2)
  })

  test('getBreedIfValid throws error if invalid', async () => {
    getBreed.mockResolvedValue(null)
    const dog = { breed: 'not-valid' }
    await expect(getBreedIfValid(dog)).rejects.toThrow('Invalid breed: not-valid')
  })

  test('getBreedIfValid returns id if found', async () => {
    getBreed.mockResolvedValue({ id: 123 })
    const payload = { breed: 'valid' }
    const res = await getBreedIfValid(payload)
    expect(res).toBe(123)
  })

  test('buildPerson calls buildContacts and adds phone1', () => {
    const payload = { phone1: '123456' }
    const res = buildPerson(payload)
    expect(res).not.toBe(null)
    expect(res.contacts.length).toBe(1)
    expect(res.contacts[0].contact).toBe('123456')
    expect(res.contacts[0].type).toBe('Phone')
  })

  test('buildPerson calls buildContacts and adds phone2', () => {
    const payload = { phone2: '234567' }
    const res = buildPerson(payload)
    expect(res).not.toBe(null)
    expect(res.contacts.length).toBe(1)
    expect(res.contacts[0].contact).toBe('234567')
    expect(res.contacts[0].type).toBe('Phone')
  })

  test('areDogLookupsValid should return false if errors', async () => {
    getBreed.mockResolvedValue(null)
    dbLogErrorToBacklog.mockResolvedValue(null)
    const row = {}
    const dog = { breed: 'invalid' }
    const res = await areDogLookupsValid(row, dog)
    expect(res).toBe(false)
  })

  test('areDogLookupsValid should return true if no errors', async () => {
    getBreed.mockResolvedValue({ id: 1 })
    dbLogErrorToBacklog.mockResolvedValue(null)
    const row = {}
    const dog = { breed: 'valid' }
    const res = await areDogLookupsValid(row, dog)
    expect(res).toBe(true)
  })

  test('arePersonLookupsValid should return false if errors', async () => {
    getCounty.mockResolvedValue(null)
    getCountry.mockResolvedValue(null)
    dbLogErrorToBacklog.mockResolvedValue(null)
    const row = {}
    const person = { first_name: 'invalid', address: { county: 'Test County', country: 'England' } }
    const res = await arePersonLookupsValid(row, person)
    expect(res).toBe(false)
  })

  test('arePersonLookupsValid should return true if no errors', async () => {
    getCounty.mockResolvedValue({ id: 2 })
    getCountry.mockResolvedValue({ id: 3 })
    dbLogErrorToBacklog.mockResolvedValue(null)
    const row = {}
    const person = { first_name: 'valid', address: { county: 'Test County', country: 'England' } }
    const res = await arePersonLookupsValid(row, person)
    expect(res).toBe(true)
  })

  test('isDogValid should return false when lookups not valid', async () => {
    const row = {}
    const dog = { breed: 'invalid' }
    const res = await isDogValid(dog, row, 1)
    expect(res).toBe(false)
  })

  test('isPersonValid should return false when lookups not valid', async () => {
    const row = {}
    const person = { first_name: 'valid', address: { county: 'Test County', country: 'England' } }
    const res = await isPersonValid(person, row, new PersonCache())
    expect(res).toBe(false)
  })

  test('insertPerson should add new person', async () => {
    const row = {}
    const person = personWithAddress
    addPeople.mockResolvedValue([])
    dbUpdate.mockResolvedValue()
    const res = await insertPerson(person, row, new PersonCache())
    expect(res).toBe('REF1')
    expect(dbUpdate).toHaveBeenCalledWith(row, { status: 'PROCESSED_NEW_PERSON', errors: '' })
  })

  test('insertPerson should not add existing person', async () => {
    const row = {}
    const person = personWithAddress
    const cache = new PersonCache()
    cache.addPerson(person)
    addPeople.mockResolvedValue([])
    dbUpdate.mockResolvedValue()
    const res = await insertPerson(person, row, cache)
    expect(res).toBe('REF1')
    expect(dbUpdate).toHaveBeenCalledWith(row, { status: 'PROCESSED_EXISTING_PERSON', errors: '' })
  })

  test('insertDog should add new dog', async () => {
    const row = { status: 'PERSON' }
    const dog = { name: 'Fido' }
    addDog.mockResolvedValue()
    dbUpdate.mockResolvedValue()
    await insertDog(dog, row)
    expect(dbUpdate).toHaveBeenCalledWith(row, { status: 'PERSON_AND_DOG', errors: '' })
  })

  test('isRegistrationValid should return false when lookups not valid', async () => {
    getPoliceForce.mockResolvedValue(null)
    const rowObj = {}
    const row = { policeForce: 'invalid' }
    const res = await isRegistrationValid(row, rowObj)
    expect(res).toBe(false)
  })

  test('isRegistrationValid should return true when lookup is valid', async () => {
    getPoliceForce.mockResolvedValue({ id: 1 })
    const rowObj = {}
    const row = { policeForce: 'valid' }
    const res = await isRegistrationValid(row, rowObj)
    expect(res).toBe(true)
  })

  test('createRegistration should call dbCreate', async () => {
    getPoliceForce.mockResolvedValue({ id: 1 })
    dbCreate.mockResolvedValue({ id: 12345 })
    const rowObj = {}
    const res = await createRegistration(1, 2, 'police force', rowObj)
    expect(dbCreate).toHaveBeenCalledTimes(1)
    expect(res).toBe(12345)
  })

  test('addComment should call dbCreate', async () => {
    dbCreate.mockResolvedValue({ id: 123456 })
    const res = await addComment('my comment text', 1)
    expect(dbCreate).toHaveBeenCalledTimes(1)
    expect(res).toBe(123456)
  })
})
