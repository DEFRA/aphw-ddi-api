const examplePerson = {
  id: 1122,
  type: 'owner',
  firstName: 'Bill',
  lastName: 'Test',
  address: {
    addressLine1: '319 Test Street',
    addressLine2: '',
    townOrCity: 'Swansea',
    postcode: 'AA1 1AA',
    country: 'England'
  },
  contacts: [
    {
      type: 'email',
      contact: 'test@example.com'
    },
    {
      type: 'phone',
      contact: '3333333333'
    }
  ]
}

const examplePersonWithCounty = {
  id: 2233,
  title: 'Mr',
  type: 'owner',
  firstName: 'Bill',
  lastName: 'Test',
  address: {
    addressLine1: '319 Test Street',
    addressLine2: '',
    townOrCity: 'Swansea',
    postcode: 'AA1 1AA',
    county: 'Tyne and Wear',
    country: 'England'
  },
  contacts: [
    {
      type: 'email',
      contact: 'test@example.com'
    },
    {
      type: 'phone',
      contact: '3333333333'
    }
  ]
}

const examplePeople = [
  examplePerson,
  examplePersonWithCounty
]

module.exports = {
  examplePerson,
  examplePersonWithCounty,
  examplePeople
}
