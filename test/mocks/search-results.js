const uniqueResults = [
  {
    id: 123,
    dog_id: 1,
    person_id: 11,
    json: {
      firstName: 'John',
      lastName: 'Smith',
      dogName: 'Bruno',
      address: {
        address_line_1: '1 test address',
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789011111
    },
    rank: 1.5
  },
  {
    id: 124,
    dog_id: 2,
    person_id: 22,
    json: {
      firstName: 'Peter',
      lastName: 'White',
      dogName: 'Butch',
      address: {
        address_line_1: '2 test address',
        postcode: 'TS2 2TS'
      },
      microchipNumber: 123456789022222
    },
    rank: 1.5
  },
  {
    id: 125,
    dog_id: 3,
    person_id: 33,
    json: {
      firstName: 'Mark',
      lastName: 'Brown',
      dogName: 'Fido',
      address: {
        address_line_1: '3 test address',
        postcode: 'TS3 3TS'
      },
      microchipNumber: 123456789033333
    },
    rank: 1.5
  }
]

const resultsForGrouping = [
  {
    id: 123,
    dog_id: 1,
    person_id: 11,
    json: {
      firstName: 'John',
      lastName: 'Smith',
      dogName: 'Bruno',
      address: {
        address_line_1: '1 test address',
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789011111
    },
    rank: 0.5
  },
  {
    id: 124,
    dog_id: 2,
    person_id: 22,
    json: {
      firstName: 'Peter',
      lastName: 'White',
      dogName: 'Butch',
      address: {
        address_line_1: '2 test address',
        postcode: 'TS2 2TS'
      },
      microchipNumber: 123456789022222
    },
    rank: 0.5
  },
  {
    id: 125,
    dog_id: 3,
    person_id: 11,
    json: {
      firstName: 'John',
      lastName: 'Smith',
      dogName: 'Fido',
      address: {
        address_line_1: '1 test address',
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789033333
    },
    rank: 0.5
  }
]

const resultsForSorting = [
  {
    id: 123,
    dog_id: 1,
    person_id: 11,
    firstName: 'John',
    lastName: 'Smith',
    dogName: 'Bruno',
    address: {
      address_line_1: '1 test address',
      postcode: 'TS1 1TS'
    },
    microchipNumber: 123456789011111,
    rank: 0.5
  },
  {
    id: 124,
    dog_id: 2,
    person_id: 22,
    firstName: 'Peter',
    lastName: 'White',
    dogName: 'Butch',
    address: {
      address_line_1: '2 test address',
      postcode: 'TS2 2TS'
    },
    microchipNumber: 123456789022222,
    rank: 0.5
  },
  {
    id: 125,
    dog_id: 3,
    person_id: 11,
    firstName: 'John',
    lastName: 'Smith',
    dogName: 'Fido',
    address: {
      address_line_1: '1 test address',
      postcode: 'TS1 1TS'
    },
    microchipNumber: 123456789033333,
    rank: 0.5
  }
]

const matchCodeResults = [
  {
    id: 123,
    dog_id: 1,
    person_id: 11,
    firstName: 'John',
    lastName: 'Smith',
    dogName: 'Bruno',
    address: {
      address_line_1: '1 test address',
      postcode: 'TS1 1TS'
    },
    microchipNumber: 123456789011111,
    rank: 1.5
  },
  {
    id: 124,
    dog_id: 2,
    person_id: 22,
    firstName: 'Peter',
    lastName: 'White',
    dogName: 'Butch',
    address: {
      address_line_1: '2 test address',
      postcode: 'TS2 2TS'
    },
    microchipNumber: 123456789022222,
    rank: 1.5
  },
  {
    id: 125,
    dog_id: 3,
    person_id: 11,
    firstName: 'John',
    lastName: 'Smith',
    dogName: 'Fido',
    address: {
      address_line_1: '1 test address',
      postcode: 'TS1 1TS'
    },
    microchipNumber: 123456789033333,
    rank: 1.5
  }
]

const trigramResults = [
  {
    id: 123,
    dog_id: 1,
    person_id: 11,
    firstName: 'John',
    lastName: 'Smith',
    dogName: 'Bruno',
    address: {
      address_line_1: '1 test address',
      postcode: 'TS1 1TS'
    },
    microchipNumber: 123456789011111,
    rank: 1.5
  },
  {
    id: 124,
    dog_id: 2,
    person_id: 22,
    firstName: 'Peter',
    lastName: 'White',
    dogName: 'Butch',
    address: {
      address_line_1: '2 test address',
      postcode: 'TS2 2TS'
    },
    microchipNumber: 123456789022222,
    rank: 1.5
  },
  {
    id: 125,
    dog_id: 3,
    person_id: 11,
    firstName: 'John',
    lastName: 'Smith',
    dogName: 'Fido',
    address: {
      address_line_1: '1 test address',
      postcode: 'TS1 1TS'
    },
    microchipNumber: 123456789033333,
    rank: 1.5
  }
]

const matchCodeSeeding = [
  {
    id: 123,
    dog_id: 1,
    person_id: 11,
    json: {
      firstName: 'John',
      lastName: 'Smith',
      dogName: 'Bruno',
      address: {
        address_line_1: '1 test address',
        town: 'Testington',
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789011111
    }
  },
  {
    id: 124,
    dog_id: 2,
    person_id: 22,
    json: {
      firstName: 'Peter',
      lastName: 'White',
      dogName: 'Butch',
      address: {
        address_line_1: '2 test address',
        town: 'Faketown',
        postcode: 'TS2 2TS'
      },
      microchipNumber: 123456789022222
    }
  },
  {
    id: 125,
    dog_id: 3,
    person_id: 11,
    json: {
      firstName: 'John',
      lastName: 'Smith',
      dogName: 'Fido',
      address: {
        address_line_1: '1 test address',
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789033333
    }
  }
]

const trigramSeeding = [
  {
    id: 123,
    dog_id: 1,
    person_id: 11,
    json: {
      address: {
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789011111,
      microchipNumber2: 345345345345345
    }
  },
  {
    id: 124,
    dog_id: 2,
    person_id: 22,
    json: {
      address: {
        postcode: 'TS2 2TS'
      },
      microchipNumber: 123456789022222
    }
  },
  {
    id: 125,
    dog_id: 3,
    person_id: 11,
    json: {
      address: {
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789033333
    }
  },
  {
    id: 126,
    dog_id: 4,
    person_id: 12,
    json: {
      address: {
        postcode: ''
      },
      microchipNumber: '',
      microchipNumber2: ''
    }
  },
  {
    id: 127,
    dog_id: 5,
    person_id: 15,
    json: {
    }
  }
]

const fuzzySearchResults = [
  { person_id: 1, match_code: '123000' },
  { person_id: 11, match_code: '125000' },
  { person_id: 1, match_code: '123400' },
  { person_id: 2, match_code: '126000' },
  { person_id: 1, match_code: '123000' },
  { person_id: 2, match_code: '123000' },
  { person_id: 3, match_code: '123000' },
  { person_id: 1, match_code: '123000' }
]

const trigramSearchResults = [
  { dog_id: 2, match_text: '123451234500000' },
  { person_id: 7, match_text: 'ts11ts' },
  { person_id: 3, match_text: 'ts33ts' },
  { person_id: 3, match_text: 'ts33ts' },
  { person_id: 7, match_text: 'ts11ts' },
  { dog_id: 2, match_text: '123450000000000' },
  { person_id: 6, match_text: 'ts66ts' },
  { dog_id: 3, match_text: '111112222233333' }
]

module.exports = {
  uniqueResults,
  resultsForGrouping,
  resultsForSorting,
  matchCodeResults,
  trigramResults,
  matchCodeSeeding,
  trigramSeeding,
  fuzzySearchResults,
  trigramSearchResults
}
