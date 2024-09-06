const { rankResult } = require('../../../../app/repos/search-rank')

describe('rankResult', () => {
  test('should return 0 if nothing matches', () => {
    const row = {
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
      }
    }
    const rank = rankResult(['john mark'], row, 'owner')
    expect(rank).toBe(0)
  })

  test('should return 2 for exact dogName match on owner search', () => {
    const row = {
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
      }
    }
    const rank = rankResult(['butch'], row, 'owner')
    expect(rank).toBe(2)
  })

  test('should return 4 for exact dogName match on dog search', () => {
    const row = {
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
      }
    }
    const rank = rankResult(['butch'], row, 'dog')
    expect(rank).toBe(4)
  })

  test('should return 4 for joined postcode match', () => {
    const row = {
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
      }
    }
    const rank = rankResult(['ts22ts'], row, 'dog')
    expect(rank).toBe(4)
  })

  test('should return 8 for exact postcode match where terms postcode is separated by a space', () => {
    const row = {
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
      }
    }
    const rank = rankResult(['ts22ts', 'ts2', '2ts'], row, 'dog')
    expect(rank).toBe(8)
  })

  test('should return 1.6666666666666667 for joined postcode PARTIAL match', () => {
    const row = {
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
      }
    }
    const rank = rankResult(['ts22tt'], row, 'dog')
    expect(rank).toBe(1.6666666666666667)
  })

  test('should return 4.666666666666667 for PARTIAL postcode match where terms postcode is separated by a space', () => {
    const row = {
      id: 124,
      dog_id: 2,
      person_id: 22,
      json: {
        firstName: 'Peter',
        lastName: 'White',
        dogName: 'Butch',
        address: {
          address_line_1: '2 test address',
          postcode: 'TS3 2TS'
        },
        microchipNumber: 123456789022222
      }
    }
    const rank = rankResult(['ts22ts', 'ts2', '2ts'], row, 'dog')
    expect(rank).toBe(4.666666666666667)
  })

  test('should return 1.6 for close match of dog name on dog search', () => {
    const row = {
      id: 124,
      dog_id: 2,
      person_id: 22,
      json: {
        firstName: 'Peter',
        lastName: 'White',
        dogName: 'Butch',
        address: {
          address_line_1: '2 test address',
          postcode: 'TS3 2TS'
        },
        microchipNumber: 123456789022222
      }
    }
    const rank = rankResult(['butc'], row, 'dog')
    expect(rank).toBe(1.6)
  })

  test('should return 3.46 for close match of microchip on dog search', () => {
    const row = {
      id: 124,
      dog_id: 2,
      person_id: 22,
      json: {
        firstName: 'Peter',
        lastName: 'White',
        dogName: 'Butch',
        address: {
          address_line_1: '2 test address',
          postcode: 'TS3 2TS'
        },
        microchipNumber: 123456789022222
      }
    }
    const rank = rankResult(['123456789022200'], row, 'dog')
    expect(rank).toBe(3.466666666666667)
  })

  test('should return 0 for poor match of microchip on dog search', () => {
    const row = {
      id: 124,
      dog_id: 2,
      person_id: 22,
      json: {
        firstName: 'Peter',
        lastName: 'White',
        dogName: 'Butch',
        address: {
          address_line_1: '2 test address',
          postcode: 'TS3 2TS'
        },
        microchipNumber: 123456789022222
      }
    }
    const rank = rankResult(['123456789000000'], row, 'dog')
    expect(rank).toBe(0)
  })

  test('should return 2.4 for close match of lastname on owner search', () => {
    const row = {
      id: 124,
      dog_id: 2,
      person_id: 22,
      json: {
        firstName: 'Peter',
        lastName: 'White',
        dogName: 'Butch',
        address: {
          address_line_1: '2 test address',
          postcode: 'TS3 2TS'
        },
        microchipNumber: 123456789022222
      }
    }
    const rank = rankResult(['Whit'], row, 'owner')
    expect(rank).toBe(2.4000000000000004)
  })

  test('should ignore lastname in dogname if same as owner name', () => {
    const row = {
      id: 124,
      dog_id: 2,
      person_id: 22,
      json: {
        firstName: 'Peter',
        lastName: 'White',
        dogName: 'Butch White',
        address: {
          address_line_1: '2 test address',
          postcode: 'TS3 2TS'
        },
        microchipNumber: 123456789022222
      }
    }
    const rank = rankResult(['butch'], row, 'dog')
    expect(rank).toBe(4)
  })

  test('should return 4 when dogname matches - giving same result as if owner lastname was included in dogname', () => {
    const row = {
      id: 124,
      dog_id: 2,
      person_id: 22,
      json: {
        firstName: 'Peter',
        lastName: 'White',
        dogName: 'Butch',
        address: {
          address_line_1: '2 test address',
          postcode: 'TS3 2TS'
        },
        microchipNumber: 123456789022222
      }
    }
    const rank = rankResult(['butch'], row, 'dog')
    expect(rank).toBe(4)
  })

  test('should return 2.4 when close match of owner lastname', () => {
    const row = {
      id: 124,
      dog_id: 2,
      person_id: 22,
      json: {
        firstName: 'Peter',
        lastName: 'White',
        dogName: 'Butch',
        address: {
          address_line_1: '2 test address',
          postcode: 'TS3 2TS'
        },
        microchipNumber: 123456789022222
      }
    }
    const rank = rankResult(['whit'], row, 'owner')
    expect(rank).toBe(2.4000000000000004)
  })
})
