const importOneDogOnePerson = {
  data: [
    {
      dogs: [
        {
          indexNumber: '1234',
          name: 'Pluto',
          dateOfBirth: '2022-11-23',
          colour: 'Brown',
          sex: 'Male',
          neutered: 'Yes',
          microchipNumber: '2134567891'
        }
      ],
      people: [
        {
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
      ],
      policeForce: 'South Wales Police'
    }
  ]
}

const importTwoDogsOnePerson = {
  data: [
    {
      dogs: [
        {
          indexNumber: '1234',
          name: 'Pluto',
          dateOfBirth: '2022-11-23',
          colour: 'Brown',
          sex: 'Male',
          neutered: 'Yes',
          microchipNumber: '2134567891'
        },
        {
          indexNumber: '2345',
          name: 'Fido',
          dateOfBirth: '2022-11-23',
          colour: 'Brown',
          sex: 'Male',
          neutered: 'Yes',
          microchipNumber: '111222333444'
        }

      ],
      people: [
        {
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
      ],
      policeForce: 'South Wales Police'
    }
  ]
}

const invalidImportSchema = {
  data: [
    {
      dogs: [
        {
          indexNumber: '1234',
          dateOfBirth: '2022-11-23',
          colour: 'Brown',
          sex: 'Male',
          neutered: 'Yes',
          microchipNumber: '2134567891'
        }
      ],
      people: [
        {
          type: 'owner',
          firstName: 'Bill',
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
      ],
      policeForce: 'South Wales Police'
    }
  ]
}

const exampleDog = {
  id: 1234,
  indexNumber: '1234',
  name: 'Pluto',
  dateOfBirth: '2022-11-23',
  colour: 'Brown',
  sex: 'Male',
  neutered: 'Yes',
  microchipNumber: '2134567891'
}

const examplePerson = {
  id: 5566,
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

module.exports = {
  importOneDogOnePerson,
  importTwoDogsOnePerson,
  invalidImportSchema,
  exampleDog,
  examplePerson
}
