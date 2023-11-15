const { getBreedIfValid, getMicrochipTypeIfValid, buildPerson, areDogLookupsValid, arePersonLookupsValid, getBacklogRows, validateAndInsertDog, validateAndInsertPerson } = require('../../../../../app/import/backlog-functions')

jest.mock('../../../../../app/lookups')
const { getBreed, getMicrochipType, getTitle, getCounty, getCountry } = require('../../../../../app/lookups')

jest.mock('../../../../../app/lib/db-functions')
const { dbLogErrorToBacklog, dbFindAll } = require('../../../../../app/lib/db-functions')

const PersonCache = require('../../../../../app/import/person-cache')

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

  test('getMicrochipTypeIfValid returns null if missing input', async () => {
    getMicrochipType.mockResolvedValue(null)
    const payload = { microchipTypexxx: 'not-valid' }
    const res = await getMicrochipTypeIfValid(payload)
    expect(res).toBe(null)
  })

  test('getMicrochipTypeIfValid throws error if invalid', async () => {
    getMicrochipType.mockResolvedValue(null)
    const payload = { microchipType: 'not-valid' }
    await expect(getMicrochipTypeIfValid(payload)).rejects.toThrow('Invalid microchip type: not-valid')
  })

  test('getMicrochipTypeIfValid returns id if found', async () => {
    getMicrochipType.mockResolvedValue({ id: 456 })
    const payload = { microchipType: 'valid' }
    const res = await getMicrochipTypeIfValid(payload)
    expect(res).toBe(456)
  })

  test('buildPerson calls buildContacts and adds phone1', async () => {
    const payload = { phone1: '123456' }
    const res = await buildPerson(payload)
    expect(res).not.toBe(null)
    expect(res.contacts.length).toBe(1)
    expect(res.contacts[0].contact).toBe('123456')
    expect(res.contacts[0].type).toBe('Phone')
  })

  test('buildPerson calls buildContacts and adds phone2', async () => {
    const payload = { phone2: '234567' }
    const res = await buildPerson(payload)
    expect(res).not.toBe(null)
    expect(res.contacts.length).toBe(1)
    expect(res.contacts[0].contact).toBe('234567')
    expect(res.contacts[0].type).toBe('Phone')
  })

  test('areDogLookupsValid should return false if errors', async () => {
    getBreed.mockResolvedValue(null)
    getMicrochipType.mockResolvedValue(null)
    dbLogErrorToBacklog.mockResolvedValue(null)
    const row = {}
    const dog = { breed: 'invalid' }
    const res = await areDogLookupsValid(row, dog)
    expect(res).toBe(false)
  })

  test('areDogLookupsValid should return true if no errors', async () => {
    getBreed.mockResolvedValue({ id: 1 })
    getMicrochipType.mockResolvedValue({ id: 2 })
    dbLogErrorToBacklog.mockResolvedValue(null)
    const row = {}
    const dog = { breed: 'valid' }
    const res = await areDogLookupsValid(row, dog)
    expect(res).toBe(true)
  })

  test('arePersonLookupsValid should return false if errors', async () => {
    getTitle.mockResolvedValue(null)
    getCounty.mockResolvedValue(null)
    getCountry.mockResolvedValue(null)
    dbLogErrorToBacklog.mockResolvedValue(null)
    const row = {}
    const person = { first_name: 'invalid', address: { county: 'Test County', country: 'England' } }
    const res = await arePersonLookupsValid(row, person)
    expect(res).toBe(false)
  })

  test('arePersonLookupsValid should return true if no errors', async () => {
    getTitle.mockResolvedValue({ id: 1 })
    getCounty.mockResolvedValue({ id: 2 })
    getCountry.mockResolvedValue({ id: 3 })
    dbLogErrorToBacklog.mockResolvedValue(null)
    const row = {}
    const person = { first_name: 'valid', address: { county: 'Test County', country: 'England' } }
    const res = await arePersonLookupsValid(row, person)
    expect(res).toBe(true)
  })

  test('validateAndInsertDog should return false when lookups not valid', async () => {
    const row = {}
    const dog = { breed: 'invalid' }
    const res = await validateAndInsertDog(dog, row, 1)
    expect(res).toBe(false)
  })

  test('validateAndInsertPerson should return null when lookups not valid', async () => {
    const row = {}
    const person = { first_name: 'valid', address: { county: 'Test County', country: 'England' } }
    const res = await validateAndInsertPerson(person, row, new PersonCache())
    expect(res).toBe(null)
  })
})
