function Dog (dogProperties) {
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
  this.microchipNumber = dogProperties.microchipNumber
  this.microchipNumber2 = dogProperties.microchipNumber2
}

module.exports = Dog
