function Person (personProperties) {
  this.id = personProperties.id
  this.personReference = personProperties.personReference
  this.firstName = personProperties.firstName
  this.lastName = personProperties.lastName
  this.dateOfBirth = personProperties.dateOfBirth
  this.addresses = personProperties.addresses
  this.person_contacts = personProperties.person_contacts
  this.organisationName = personProperties.organisationName
}

module.exports = Person
