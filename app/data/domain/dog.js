const { Changeable } = require('./changeable')
const { DuplicateResourceError } = require('../../errors/duplicate-record')
const { InvalidDataError } = require('../../errors/domain/invalidData')

class Dog extends Changeable {
  constructor (dogProperties) {
    super()
    this.id = dogProperties.id
    this.dogReference = dogProperties.dogReference
    this.indexNumber = dogProperties.indexNumber
    this.name = dogProperties.name
    this.breed = dogProperties.breed
    this._status = dogProperties.status
    this.dateOfBirth = dogProperties.dateOfBirth
    this.dateOfDeath = dogProperties.dateOfDeath
    this.tattoo = dogProperties.tattoo
    this.colour = dogProperties.colour
    this.sex = dogProperties.sex
    this.dateExported = dogProperties.dateExported
    this.dateStolen = dogProperties.dateStolen
    this.dateUntraceable = dogProperties.dateUntraceable
    this._microchipNumber = dogProperties.microchipNumber
    this.microchipNumber2 = dogProperties.microchipNumber2
    this._breaches = dogProperties.dogBreaches
  }

  get microchipNumber () {
    return this._microchipNumber
  }

  setMicrochipNumber (microchipNumber1, duplicateMicrochip, callback) {
    if (this._microchipNumber === microchipNumber1) {
      return
    }

    if (!microchipNumber1.match(/^[0-9]*$/)) {
      throw new InvalidDataError('Invalid Microchip number - contains a non-numeric character')
    }

    if (microchipNumber1.length !== 15) {
      throw new InvalidDataError('Invalid Microchip number - must be 15 characters long')
    }

    if (microchipNumber1 === duplicateMicrochip) {
      throw new DuplicateResourceError('The microchip number already exists', { microchipNumbers: [microchipNumber1] })
    }

    this._updates.update('microchip', microchipNumber1, callback)
    this._microchipNumber = microchipNumber1
  }

  get status () {
    return this._status
  }

  setStatus (status, callback) {
    this._updates.update('status', status, callback)
    this._status = status
  }

  get breaches () {
    return this._breaches
  }

  setBreaches (breaches, allDogBreaches, callback) {
    const dogBreachDictionary = allDogBreaches.reduce((dogBreachDict, breach) => {
      return {
        ...dogBreachDict,
        [breach.short_name]: breach
      }
    }, {})
    this._status = 'In breach'
    const matchedBreachCategories = breaches.map(breach => dogBreachDictionary[breach])
    this._breaches = matchedBreachCategories
    this._updates.update('breaches', {
      status: 'In breach',
      categories: matchedBreachCategories
    }, callback)
  }
}

module.exports = Dog
