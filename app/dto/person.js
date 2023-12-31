const addContacts = (contacts) => {
  const emails = contacts.filter(entry => entry.contact.contact_type.contact_type === 'Email')
    .sort((a, b) => b.id - a.id)

  const primaryTelephones = contacts.filter(entry => entry.contact.contact_type.contact_type === 'Phone')
    .sort((a, b) => b.id - a.id)

  const secondaryTelephones = contacts.filter(entry => entry.contact.contact_type.contact_type === 'SecondaryPhone')
    .sort((a, b) => b.id - a.id)

  return {
    emails: emails.map((email) => email.contact.contact),
    primaryTelephones: primaryTelephones.map((phone) => phone.contact.contact),
    secondaryTelephones: secondaryTelephones.map((phone) => phone.contact.contact)
  }
}

const personDto = (person) => ({
  firstName: person.first_name,
  lastName: person.last_name,
  birthDate: person.birth_date,
  personReference: person.person_reference,
  address: {
    addressLine1: person.addresses[0].address.address_line_1,
    addressLine2: person.addresses[0].address.address_line_2,
    town: person.addresses[0].address.town,
    postcode: person.addresses[0].address.postcode,
    country: person.addresses[0].address.country.country
  },
  contacts: person.person_contacts ? addContacts(person.person_contacts) : []
})

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
  dogs: personAndDogs.map(x => ({
    id: x.dog.id,
    indexNumber: x.dog.index_number,
    dogReference: x.dog.dog_reference,
    microchipNumber: x.dog.dog_microchips?.length >= 1 ? x.dog.dog_microchips[0].microchip?.microchip_number : null,
    microchipNumber2: x.dog.dog_microchips?.length >= 2 ? x.dog.dog_microchips[1].microchip?.microchip_number : null,
    breed: x.dog.dog_breed.breed,
    name: x.dog.name,
    status: x.dog.status.status,
    birthDate: x.dog.birth_date,
    tattoo: x.dog.tattoo,
    colour: x.dog.colour,
    sex: x.dog.sex
  }))
})

module.exports = {
  personDto,
  personAndDogsDto
}
