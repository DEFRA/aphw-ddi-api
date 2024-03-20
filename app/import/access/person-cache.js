const generatePersonMatchCodes = require('./person-match-codes')

class PersonCache {
  constructor (config) {
    this.cache = new Map()
    this.config = config
  }

  prepopulate (rows) {
    for (const row of rows) {
      this.addMatchCodes(row)
      this.addPerson(row)
    }
  }

  getPersonRefIfAlreadyExists (person) {
    for (const matchCode of person.matchCodes) {
      if (this.cache.has(matchCode)) {
        return this.cache.get(matchCode)
      }
    }
    return null
  }

  addPerson (person) {
    for (const matchCode of person.matchCodes) {
      this.cache.set(matchCode, person.person_reference)
      this.cache.set(person.person_reference, person)
    }
  }

  getPerson (person) {
    const ref = this.getPersonRefIfAlreadyExists(person)
    return ref ? this.cache.get(ref) : null
  }

  addMatchCodes (person) {
    person.matchCodes = generatePersonMatchCodes(person, this.config)
  }
}

module.exports = PersonCache
