const overnightRows = [
  {
    dog: {
      index_number: 'ED123'
    }
  },
  {
    dog: {
      index_number: 'ED124'
    }
  },
  {
    dog: {
      index_number: 'ED125'
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
