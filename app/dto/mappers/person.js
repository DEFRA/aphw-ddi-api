const countryMapper = (country) => ({
  id: country.id,
  country: country.country
})

const addressMapper = (address) => ({
  id: address.id,
  address_line_1: address.address_line_1,
  address_line_2: address.address_line_2,
  town: address.town,
  postcode: address.postcode,
  county: address.county,
  country_id: address.country_id,
  country: countryMapper(address.country)
})

const personAddressMapper = (personAddress) => ({
  id: personAddress.id,
  person_id: personAddress.person_id,
  address_id: personAddress.address_id,
  address: addressMapper(personAddress.address)
})

const contactTypeMapper = (contactType) => ({
  id: contactType.id,
  contact_type: contactType.contact_type
})

const contactMapper = (contact) => ({
  id: contact.id,
  contact: contact.contact,
  contact_type_id: contact.contact_type_id,
  contact_type: contactTypeMapper(contact.contact_type)
})

const personContactMapper = (personContact) => ({
  id: personContact.id,
  person_id: personContact.person_id,
  contact_id: personContact.contact_id,
  contact: contactMapper(personContact.contact)
})

const registeredPersonMapper = (registeredPerson) => ({
  id: registeredPerson.id,
  person_id: registeredPerson.person_id,
  dog_id: registeredPerson.dog_id,
  person_type_id: registeredPerson.person_type_id,
  person: {
    id: registeredPerson.person.id,
    first_name: registeredPerson.person.first_name,
    last_name: registeredPerson.person.last_name,
    person_reference: registeredPerson.person.person_reference,
    birth_date: registeredPerson.person.birth_date,
    organisation_id: registeredPerson.person.organisation_id,
    addresses: registeredPerson.person.addresses.map(personAddressMapper),
    person_contacts: registeredPerson.person.person_contacts.map(personContactMapper)
  },
  person_type: {
    id: registeredPerson.person_type.id,
    person_type: registeredPerson.person_type.person_type
  }
})

module.exports = {
  countryMapper,
  personContactMapper,
  contactMapper,
  contactTypeMapper,
  personAddressMapper,
  addressMapper,
  registeredPersonMapper
}
