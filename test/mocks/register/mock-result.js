const add = [{
  person: {
    firstName: 'Mary',
    lastName: 'Poppins',
    addressLine1: '319 test street',
    townOrCity: 'London',
    country: 'England',
    dateOfBirth: '10/05/1998',
    phoneNumber: 7507307991,
    email: 'defra@defraemailtest.com'
  },
  dog: {
    name: 'Bruce',
    dateOfBirth: '07/11/2021',
    colour: 'Brown',
    gender: 'Male',
    insuranceStartDate: '11/11/2023',
    neutered: 'Yes',
    microchipped: 'Yes',
    microchipNumber: 2134567891,
    indexNumber: '1234',
    applicationStatus: 'Approved'
  }
}]

const skipped = [{
  rowNum: 1,
  row: {
    person: {
      firstName: 'Mary',
      lastName: 'Poppins',
      addressLine1: '319 test street',
      townOrCity: 'London',
      country: 'England',
      dateOfBirth: '10/05/1998',
      phoneNumber: 7507307991,
      email: 'defra@defraemailtest.com'
    },
    dog: {
      name: 'Bruce',
      dateOfBirth: '07/11/2021',
      colour: 'Brown',
      gender: 'Male',
      insuranceStartDate: '11/11/2023',
      neutered: 'Yes',
      microchipped: 'Yes',
      microchipNumber: 2134567891,
      indexNumber: '1234',
      applicationStatus: 'Approved'
    }
  },
  messages: ['Application not "Approved"']
}]

const errors = [{
  rowNum: 1,
  row: {
    person: {
      firstName: 'Mary',
      lastName: 'Poppins',
      addressLine1: '319 test street',
      townOrCity: 'London',
      country: 'England',
      dateOfBirth: '10/05/1998',
      phoneNumber: 7507307991,
      email: 'defra@defraemailtest.com'
    },
    dog: {
      name: 'Bruce',
      dateOfBirth: '07/11/2021',
      colour: 'Brown',
      gender: 'Male',
      insuranceStartDate: '11/11/2023',
      neutered: 'Yes',
      microchipped: 'Yes',
      microchipNumber: 2134567891,
      indexNumber: '1234',
      applicationStatus: 'Approved'
    }
  },
  errors: [
    {
      message: '"person.postcode" is required',
      path: ['person', 'postcode'],
      type: 'any.required',
      context: {
        label: 'person.postcode',
        key: 'postcode'
      }
    }
  ]
}]

module.exports = {
  add,
  errors,
  skipped
}
