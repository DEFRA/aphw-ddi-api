/**
 * @typedef PersonProperties
 * @property id
 * @property personReference
 * @property firstName
 * @property lastName
 * @property dateOfBirth
 * @property addresses
 * @property person_contacts
 * @property organisationName
 * @property contactDetails
 */
class Person {
  /**
   * @param {PersonProperties} personProperties
   */
  constructor (personProperties) {
    this.id = personProperties.id
    this.personReference = personProperties.personReference
    this.firstName = personProperties.firstName
    this.lastName = personProperties.lastName
    this.dateOfBirth = personProperties.dateOfBirth
    this.addresses = personProperties.addresses
    this.person_contacts = personProperties.person_contacts
    this.organisationName = personProperties.organisationName
    this.contactDetails = personProperties.contactDetails
  }
}

module.exports = Person
