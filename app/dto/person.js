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

module.exports = {
  personDto
}
