const uniqueResults = [
  {
    dog_id: 1,
    person_id: 11,
    json: {
      firstName: 'John',
      lastName: 'Smith',
      dogName: 'Bruno',
      address: '1 test address',
      microchipNumber: 123456789011111
    },
    rank: 0.5
  },
  {
    dog_id: 2,
    person_id: 22,
    json: {
      firstName: 'Peter',
      lastName: 'White',
      dogName: 'Butch',
      address: '2 test address',
      microchipNumber: 123456789022222
    },
    rank: 0.5
  },
  {
    dog_id: 3,
    person_id: 33,
    json: {
      firstName: 'Mark',
      lastName: 'Brown',
      dogName: 'Fido',
      address: '3 test address',
      microchipNumber: 123456789033333
    },
    rank: 0.5
  }
]

const resultsForGrouping = [
  {
    dog_id: 1,
    person_id: 11,
    json: {
      firstName: 'John',
      lastName: 'Smith',
      dogName: 'Bruno',
      address: '1 test address',
      microchipNumber: 123456789011111
    },
    rank: 0.5
  },
  {
    dog_id: 2,
    person_id: 22,
    json: {
      firstName: 'Peter',
      lastName: 'White',
      dogName: 'Butch',
      address: '2 test address',
      microchipNumber: 123456789022222
    },
    rank: 0.5
  },
  {
    dog_id: 3,
    person_id: 11,
    json: {
      firstName: 'John',
      lastName: 'Smith',
      dogName: 'Fido',
      address: '1 test address',
      microchipNumber: 123456789033333
    },
    rank: 0.5
  }
]

const resultsForSorting = [
  {
    dog_id: 1,
    person_id: 11,
    firstName: 'John',
    lastName: 'Smith',
    dogName: 'Bruno',
    address: '1 test address',
    microchipNumber: 123456789011111,
    rank: 0.5
  },
  {
    dog_id: 2,
    person_id: 22,
    firstName: 'Peter',
    lastName: 'White',
    dogName: 'Butch',
    address: '2 test address',
    microchipNumber: 123456789022222,
    rank: 0.5
  },
  {
    dog_id: 3,
    person_id: 11,
    firstName: 'John',
    lastName: 'Smith',
    dogName: 'Fido',
    address: '1 test address',
    microchipNumber: 123456789033333,
    rank: 0.5
  }
]

module.exports = {
  uniqueResults,
  resultsForGrouping,
  resultsForSorting
}
