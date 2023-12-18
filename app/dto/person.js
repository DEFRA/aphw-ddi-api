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
  }
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
    microchipNumber: x.dog.microchip_number,
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
