const { Changeable } = require('./changeable')
const { DuplicateResourceError } = require('../../errors/duplicate-record')

class Dog extends Changeable {
  constructor (dogProperties) {
    super()
    this.id = dogProperties.id
    this.dogReference = dogProperties.dogReference
    this.indexNumber = dogProperties.indexNumber
    this.name = dogProperties.name
    this.breed = dogProperties.breed
    this.status = dogProperties.status
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
  }

  get microchipNumber () {
    return this._microchipNumber
  }

  setMicrochipNumber (microchipNumber1, duplicateMicrochip, callback) {
    if (this._microchipNumber === microchipNumber1) {
      return
    }

    if (microchipNumber1 === duplicateMicrochip) {
      throw new DuplicateResourceError('The microchip number already exists', { microchipNumbers: [microchipNumber1] })
    }

    this._updates.update('microchip', microchipNumber1, callback)
    this._microchipNumber = microchipNumber1
  }
}

module.exports = Dog
