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
})
