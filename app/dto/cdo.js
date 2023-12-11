const cdoCreateDto = (data) => ({
  owner: {
    firstName: data.owner.first_name,
    lastName: data.owner.last_name,
    birthDate: data.owner.birth_date,
    address: {
      addressLine1: data.owner.address.address_line_1,
      addressLine2: data.owner.address.address_line_2,
      town: data.owner.address.town,
      postcode: data.owner.address.postcode,
      country: data.owner.address.country.country
    }
  },
  enforcementDetails: {
    policeForce: data.dogs[0].registration.police_force.name,
    court: data.dogs[0].registration.court.name,
    legislationOfficer: data.dogs[0].registration.legislation_officer
  },
  dogs: data.dogs.map(d => ({
    indexNumber: d.index_number,
    name: d.name,
    breed: d.dog_breed.breed,
    cdoIssued: d.registration.cdo_issued,
    cdoExpiry: d.registration.cdo_expiry
  }))
})

module.exports = {
  cdoCreateDto
}
