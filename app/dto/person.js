const { getMicrochip } = require('./dto-helper')

/**
 * @typedef LatestContact
 * @property {string} email
 * @property {string} primaryTelephone
 * @property {string} secondaryTelephone
 */
/**
 * @typedef ContactList
 * @property {string[]} emails
 * @property {string[]} primaryTelephones
 * @property {string[]} secondaryTelephones
 */
/**
 * @typedef Contacts
 * @type {LatestContact|ContactList}
 */
/**
 * @param contacts
 * @param {boolean} onlyLatest
 * @returns {Contacts}
 */
const addContacts = (contacts, onlyLatest) => {
  const emails = contacts.filter(entry => entry.contact.contact_type.contact_type === 'Email')
    .sort((a, b) => b.id - a.id)

  const primaryTelephones = contacts.filter(entry => entry.contact.contact_type.contact_type === 'Phone')
    .sort((a, b) => b.id - a.id)

  const secondaryTelephones = contacts.filter(entry => entry.contact.contact_type.contact_type === 'SecondaryPhone')
    .sort((a, b) => b.id - a.id)

  const contactsList = {
    emails: emails.map((email) => email.contact.contact),
    primaryTelephones: primaryTelephones.map((phone) => phone.contact.contact),
    secondaryTelephones: secondaryTelephones.map((phone) => phone.contact.contact)
  }

  if (!onlyLatest) {
    return contactsList
  }

  return {
    email: contactsList.emails.length ? contactsList.emails[0] : null,
    primaryTelephone: contactsList.primaryTelephones.length ? contactsList.primaryTelephones[0] : null,
    secondaryTelephone: contactsList.secondaryTelephones.length ? contactsList.secondaryTelephones[0] : null
  }
}
/**
 * @typedef Address
 * @property {string} addressLine1
 * @property {string} addressLine2
 * @property {string} town
 * @property {string} postcode
 * @property {string} country
 */
/**
 * @typedef PersonDto
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} birthDate
 * @property {string} personReference
 * @property {Address} address
 * @property {Contacts | []} contacts
 *
 */
/**
 * @param person
 * @param onlyLatestContacts
 * @returns {PersonDto}
 */
const personDto = (person, onlyLatestContacts) => ({
  firstName: person.first_name,
  lastName: person.last_name,
  birthDate: person.birth_date,
  personReference: person.person_reference,
  address: {
    addressLine1: person.addresses ? person.addresses[0].address.address_line_1 : '',
    addressLine2: person.addresses ? person.addresses[0].address.address_line_2 : '',
    town: person.addresses ? person.addresses[0].address.town : '',
    postcode: person.addresses ? person.addresses[0].address.postcode : '',
    country: person.addresses ? person.addresses[0].address.country.country : ''
  },
  contacts: person.person_contacts ? addContacts(person.person_contacts, onlyLatestContacts) : [],
  organisationName: person.organisation?.organisation_name
})
/**
 * @typedef AddressDto
 * @property {string} country
 * @property {string} town
 * @property {string} postcode
 * @property {string} addressLine1
 * @property {string} addressLine2
 */
/**
 * @typedef {string} BreachDto
 */
/**
 * @typedef PersonDogDto
 * @property {number} id
 * @property {string} indexNumber
 * @property {string} name
 * @property {string} breed
 * @property {string} microchipNumber
 * @property {string} microchipNumber2
 * @property {string} colour
 * @property {string} sex
 * @property {string} status
 * @property {Date} birthDate
 * @property {string} tattoo
 * @property {BreachDto[]} breaches
 */
/**
 * @typedef PersonAndDogsDto
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} birthDate
 * @property {string} personReference
 * @property {string} organisationName
 * @property {AddressDto} address
 * @property {PersonDogDto[]} dogs
 * @property {PersonContact[]} contacts
 */
/**
 *
 * @param personAndDogs
 * @return {PersonAndDogsDto}
 */
const personAndDogsDto = (personAndDogs) => ({
  firstName: personAndDogs[0].person.first_name,
  lastName: personAndDogs[0].person.last_name,
  birthDate: personAndDogs[0].person.birth_date,
  personReference: personAndDogs[0].person.person_reference,
  address: {
    addressLine1: personAndDogs[0].person.addresses[0].address.address_line_1,
    addressLine2: personAndDogs[0].person.addresses[0].address.address_line_2,
    town: personAndDogs[0].person.addresses[0].address.town,
    postcode: personAndDogs[0].person.addresses[0].address.postcode,
    country: personAndDogs[0].person.addresses[0].address.country.country
  },
  contacts: personAndDogs[0].person.person_contacts,
  organisationName: personAndDogs[0].person.organisation?.organisation_name,
  dogs: personAndDogs[0].dog
    ? personAndDogs.map(x => ({
      id: x.dog.id,
      indexNumber: x.dog.index_number,
      dogReference: x.dog.dog_reference,
      microchipNumber: getMicrochip(x.dog, 1),
      microchipNumber2: getMicrochip(x.dog, 2),
      breed: x.dog.dog_breed.breed,
      name: x.dog.name,
      status: x.dog.status.status,
      birthDate: x.dog.birth_date,
      tattoo: x.dog.tattoo,
      colour: x.dog.colour,
      sex: x.dog.sex
    }))
    : []
})

/**
 * @param {RegisteredPerson} registeredPerson
 * @return {PersonDogDto}
 */
const mapRegisteredPersonToDog = (registeredPerson) => {
  const { dog } = registeredPerson

  return {
    breed: dog.dog_breed.breed,
    colour: dog.colour,
    dogReference: dog.dog_reference,
    id: dog.id,
    indexNumber: dog.index_number,
    microchipNumber: getMicrochip(dog, 1),
    microchipNumber2: getMicrochip(dog, 2),
    name: dog.name,
    sex: dog.sex,
    status: dog.status.status,
    tattoo: dog.tattoo,
    birthDate: dog.birth_date
  }
}

/**
 * @param {PersonAndDogsByIndexDao} personAndDogsByIndexDao
 * @return {PersonAndDogsDto}
 */
const mapPersonAndDogsByIndexDao = (personAndDogsByIndexDao) => {
  const { person } = personAndDogsByIndexDao

  return {
    firstName: person.first_name,
    lastName: person.last_name,
    birthDate: person.birth_date,
    personReference: person.person_reference,
    address: {
      addressLine1: person.addresses[0].address.address_line_1,
      addressLine2: person.addresses[0].address.address_line_2,
      country: person.addresses[0].address.country.country,
      postcode: person.addresses[0].address.postcode,
      town: person.addresses[0].address.town
    },
    contacts: person.person_contacts,
    dogs: person.registered_people.map(mapRegisteredPersonToDog),
    organisationName: person.organisation?.organisation_name
  }
}

module.exports = {
  personDto,
  personAndDogsDto,
  mapPersonAndDogsByIndexDao
}
