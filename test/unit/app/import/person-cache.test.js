const { personMatchCodesStandard, personMatchCodesStandardMatch, personMatchCodesOther, personMatchCodesNoCodes } = require('./persons')
const PersonCache = require('../../../../app/import/access/person-cache')

describe('PersonCache test', () => {
  let cache

  beforeEach(() => {
    cache = new PersonCache({})
  })

  test('getPersonRefIfAlreadyExists returns null if person not in the cache', () => {
    const ref = cache.getPersonRefIfAlreadyExists(personMatchCodesStandard)
    expect(ref).toBe(null)
  })

  test('AddPerson stores person in the cache', () => {
    cache.addPerson(personMatchCodesStandard)
    const ref = cache.getPersonRefIfAlreadyExists(personMatchCodesStandard)
    expect(ref).toBe('PREF_STD1')
  })

  test('GetPersonRef retrieves correct ref from the cache', () => {
    cache.addPerson(personMatchCodesStandard)
    cache.addPerson(personMatchCodesOther)
    const ref1 = cache.getPersonRefIfAlreadyExists(personMatchCodesStandard)
    expect(ref1).toBe('PREF_STD1')
    const ref2 = cache.getPersonRefIfAlreadyExists(personMatchCodesOther)
    expect(ref2).toBe('PREF_OTH1')
  })

  test('GetPersonRef retrieves similar person from the cache', () => {
    cache.addPerson(personMatchCodesStandard)
    cache.addPerson(personMatchCodesOther)
    const ref1 = cache.getPersonRefIfAlreadyExists(personMatchCodesStandardMatch)
    expect(ref1).toBe('PREF_STD1')
  })

  test('prepopulate() correctly populates the cache', () => {
    const rows = [personMatchCodesStandard, personMatchCodesOther]
    cache.prepopulate(rows)
    const ref1 = cache.getPersonRefIfAlreadyExists(personMatchCodesStandard)
    expect(ref1).toBe('PREF_STD1')
    const ref2 = cache.getPersonRefIfAlreadyExists(personMatchCodesOther)
    expect(ref2).toBe('PREF_OTH1')
  })

  test('addMatchCodes() adds codes to person', () => {
    const person = personMatchCodesNoCodes
    cache.addMatchCodes(person)
    expect(person.matchCodes).not.toBe(null)
    expect(person.matchCodes.length).toBe(1)
    expect(person.matchCodes[0]).toBe('david^embleton')
  })
})
