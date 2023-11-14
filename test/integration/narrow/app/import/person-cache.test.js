const { personStandard, personStandardMatch, personOther, personNoCodes } = require('./persons')
const PersonCache = require('../../../../../app/import/person-cache')

describe('PersonCache test', () => {
  let cache

  beforeEach(() => {
    cache = new PersonCache({})
  })

  test('getPersonRefIfAlreadyExists returns null if person not in the cache', () => {
    const ref = cache.getPersonRefIfAlreadyExists(personStandard)
    expect(ref).toBe(null)
  })

  test('AddPerson stores person in the cache', () => {
    cache.addPerson(personStandard)
    const ref = cache.getPersonRefIfAlreadyExists(personStandard)
    expect(ref).toBe('PREF_STD1')
  })

  test('GetPersonRef retrieves correct ref from the cache', () => {
    cache.addPerson(personStandard)
    cache.addPerson(personOther)
    const ref1 = cache.getPersonRefIfAlreadyExists(personStandard)
    expect(ref1).toBe('PREF_STD1')
    const ref2 = cache.getPersonRefIfAlreadyExists(personOther)
    expect(ref2).toBe('PREF_OTH1')
  })

  test('GetPersonRef retrieves similar person from the cache', () => {
    cache.addPerson(personStandard)
    cache.addPerson(personOther)
    const ref1 = cache.getPersonRefIfAlreadyExists(personStandardMatch)
    expect(ref1).toBe('PREF_STD1')
  })

  test('prepopulate() correctly populates the cache', () => {
    const rows = [personStandard, personOther]
    cache.prepopulate(rows)
    const ref1 = cache.getPersonRefIfAlreadyExists(personStandard)
    expect(ref1).toBe('PREF_STD1')
    const ref2 = cache.getPersonRefIfAlreadyExists(personOther)
    expect(ref2).toBe('PREF_OTH1')
  })

  test('addMatchCodes() adds codes to person', () => {
    const person = personNoCodes
    cache.addMatchCodes(person)
    expect(person.matchCodes).not.toBe(null)
    expect(person.matchCodes.length).toBe(1)
    expect(person.matchCodes[0]).toBe('david^embleton')
  })
})
