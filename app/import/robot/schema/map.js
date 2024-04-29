const map = {
  Owner: {
    owner: {
      FirstName: 'firstName',
      LastName: 'lastName',
      DateOfBirth: 'birthDate',
      Address: {
        address: {
          AddressLine1: 'addressLine1',
          AddressLine2: 'addressLine2',
          TownOrCity: 'town',
          County: 'county',
          Country: 'country',
          PostCode: 'postcode'
        }
      },
      PhoneNumber: 'phoneNumber',
      EmailAddress: 'email'
    }
  },
  Dog: {
    dog: {
      'Index Number': 'indexNumber',
      DogsName: 'name',
      DogColour: 'colour',
      DogGender: 'gender',
      DogDOB: 'birthDate',
      MicrochipNumber: 'microchipNumber',
      'Insurance Start Date': 'insuranceStartDate',
      'Certificate Issued': 'certificateIssued'
    }
  }
}

module.exports = map
