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

const moreThanTenResults = [
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
  },
  {
    id: 126,
    dog_id: 4,
    person_id: 12,
    json: {
      firstName: 'John2',
      lastName: 'Smith2',
      dogName: 'Fido2',
      address: {
        address_line_1: '1 test address',
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789033332
    },
    rank: 0.5
  },
  {
    id: 127,
    dog_id: 5,
    person_id: 13,
    json: {
      firstName: 'John3',
      lastName: 'Smith3',
      dogName: 'Fido3',
      address: {
        address_line_1: '1 test address',
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789033330
    },
    rank: 0.5
  },
  {
    id: 128,
    dog_id: 6,
    person_id: 14,
    json: {
      firstName: 'John4',
      lastName: 'Smith4',
      dogName: 'Fido4',
      address: {
        address_line_1: '1 test address',
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789033334
    },
    rank: 0.5
  },
  {
    id: 129,
    dog_id: 7,
    person_id: 15,
    json: {
      firstName: 'John5',
      lastName: 'Smith5',
      dogName: 'Fido5',
      address: {
        address_line_1: '1 test address',
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789033335
    },
    rank: 0.5
  },
  {
    id: 130,
    dog_id: 8,
    person_id: 16,
    json: {
      firstName: 'John6',
      lastName: 'Smith6',
      dogName: 'Fido6',
      address: {
        address_line_1: '1 test address',
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789033336
    },
    rank: 0.5
  },
  {
    id: 131,
    dog_id: 9,
    person_id: 17,
    json: {
      firstName: 'John7',
      lastName: 'Smith7',
      dogName: 'Fido7',
      address: {
        address_line_1: '1 test address',
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789033337
    },
    rank: 0.5
  },
  {
    id: 132,
    dog_id: 10,
    person_id: 18,
    json: {
      firstName: 'John8',
      lastName: 'Smith8',
      dogName: 'Fido8',
      address: {
        address_line_1: '1 test address',
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789033338
    },
    rank: 0.5
  },
  {
    id: 133,
    dog_id: 11,
    person_id: 18,
    json: {
      firstName: 'John8',
      lastName: 'Smith8',
      dogName: 'Fido8',
      address: {
        address_line_1: '1 test address',
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789033337
    },
    rank: 0.5
  },
  {
    id: 134,
    dog_id: 12,
    person_id: 19,
    json: {
      firstName: 'John9',
      lastName: 'Smith9',
      dogName: 'Fido9',
      address: {
        address_line_1: '1 test address',
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789033337
    },
    rank: 0.5
  },
  {
    id: 135,
    dog_id: 13,
    person_id: 20,
    json: {
      firstName: 'John10',
      lastName: 'Smith10',
      dogName: 'Fido10',
      address: {
        address_line_1: '1 test address',
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789033337
    },
    rank: 0.5
  },
  {
    id: 136,
    dog_id: 14,
    person_id: 21,
    json: {
      firstName: 'John11',
      lastName: 'Smith11',
      dogName: 'Fido11',
      address: {
        address_line_1: '1 test address',
        postcode: 'TS1 1TS'
      },
      microchipNumber: 123456789033337
    },
    rank: 0.5
  }
]

const moreThanTwentyResults = () => {
  const results1 = JSON.parse(JSON.stringify(moreThanTenResults))
  const results2 = JSON.parse(JSON.stringify(moreThanTenResults))
  const results3 = JSON.parse(JSON.stringify(moreThanTenResults))
  results1.forEach(res => {
    res.rank = 1.5
  })
  results2.forEach(res => {
    res.id = res.id + 20
    res.person_id = res.person_id + 20
    res.rank = 1.5
  })
  results3.forEach(res => {
    res.id = res.id + 40
    res.person_id = res.person_id + 40
    res.rank = 1.5
  })
  return results1.concat(results2).concat(results3)
}

module.exports = {
  uniqueResults,
  resultsForGrouping,
  resultsForSorting,
  matchCodeResults,
  trigramResults,
  matchCodeSeeding,
  trigramSeeding,
  fuzzySearchResults,
  trigramSearchResults,
  moreThanTenResults,
  moreThanTwentyResults
}
