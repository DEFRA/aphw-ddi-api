const { Changeable } = require('./changeable')
const { DuplicateResourceError } = require('../../errors/duplicate-record')
const { InvalidDataError } = require('../../errors/domain/invalidData')
const { statuses } = require('../../constants/statuses')
/**
 * @property {number} id
 * @property {string|null} dogReference = dogProperties.dogReference
 * @property {string|null} indexNumber = dogProperties.indexNumber
 * @property {string|null} name = dogProperties.name
 * @property {string|null} breed = dogProperties.breed
 * @property {Date|null} dateOfBirth = dogProperties.dateOfBirth
 * @property {Date|null} dateOfDeath = dogProperties.dateOfDeath
 * @property {string|null} tattoo = dogProperties.tattoo
 * @property {string|null} colour = dogProperties.colour
 * @property {string|null} sex = dogProperties.sex
 * @property {Date|null} dateExported = dogProperties.dateExported
 * @property {Date|null} dateStolen = dogProperties.dateStolen
 * @property {Date|null} dateUntraceable = dogProperties.dateUntraceable
 * @property {string|null} microchipNumber2 = dogProperties.microchipNumber2
 * @property {BreachCategory[]} breaches = dogProperties.breaches
 */
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

  /**
   * @return {string|null}
   */
  get microchipNumber () {
    return this._microchipNumber
  }

  setMicrochipNumber (microchipNumber1, duplicateMicrochip, callback) {
    if (this._microchipNumber === microchipNumber1) {
      return
    }

    if (!microchipNumber1.match(/^[0-9]*$/)) {
      throw new InvalidDataError('Microchip number must be digits only')
    }

    if (microchipNumber1.length !== 15) {
      throw new InvalidDataError('Microchip number must be 15 digits in length')
    }

    if (microchipNumber1 === duplicateMicrochip) {
      throw new DuplicateResourceError('Microchip number already exists', { microchipNumbers: [microchipNumber1] })
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

  /**
   * @return {BreachCategory[]}
   */
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
    const dogBreachBreaches = breaches.map(breach => dogBreachDictionary[breach])
    this._breaches = dogBreachBreaches
    this._updates.update('dogBreaches', dogBreachBreaches, undefined)
    this.setStatus(statuses.InBreach, callback)
  }

  get youngerThanSixteenMonths () {
    const sixteenMonths = new Date()
    sixteenMonths.setUTCHours(0, 0, 0, 0)
    sixteenMonths.setUTCMonth(sixteenMonths.getUTCMonth() - 16)

    if (!this.dateOfBirth) {
      return undefined
    }

    return this.dateOfBirth.getTime() < sixteenMonths.getTime()
  }
}

module.exports = Dog
