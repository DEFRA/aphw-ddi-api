const overnightRows = [
  {
    dog: {
      index_number: 'ED123',
      status: {
        status: 'Exempt'
      },
      dog_breaches: []
    }
  },
  {
    dog: {
      index_number: 'ED124',
      status: {
        status: 'Exempt'
      },
      dog_breaches: []
    }
  },
  {
    dog: {
      index_number: 'ED125',
      status: {
        status: 'Exempt'
      },
      dog_breaches: []
    }
  }
]

const overnightRowsInBreach = [
  {
    dog: {
      index_number: 'ED123',
      breed: {
        breed: 'XL Bully'
      },
      status: 'In breach'
    }
  },
  {
    dog: {
      index_number: 'ED125',
      breed: {
        breed: 'XL Bully'
      },
      status: 'In breach'
    }
  }
]

module.exports = {
  overnightRows,
  overnightRowsInBreach
}
