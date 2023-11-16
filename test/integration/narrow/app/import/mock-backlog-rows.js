const backlogRows = [
  {
    id: 1,
    dataValues: {
      json: {
        title: 'Mr',
        firstName: 'Bill',
        lastName: 'Test',
        addressLine1: '319 test street',
        addressLine3: 'Swansea',
        postcodePart1: 'AA1',
        postcodePart2: '1AA',
        phone1: '3333333333',
        dogName: 'Bruno'
      }
    },
    errors: {},
    status: 'IMPORTED'
  },
  {
    id: 2,
    dataValues: {
      json: {
        title: 'Mrs',
        firstName: 'Jane',
        lastName: 'Tesling',
        addressLine1: '123 checking rd',
        addressLine3: 'Cambridge',
        postcodePart1: 'CB1',
        postcodePart2: '1CB',
        phone1: '222222222',
        dogName: 'Mars'
      }
    },
    errors: {},
    status: 'IMPORTED'
  }
]

module.exports = backlogRows
