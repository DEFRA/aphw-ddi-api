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
      indexNumber: 'ED123',
      breed: {
        breed: 'XL Bully'
      },
      status: 'In breach',
      dog_breaches: [{
        breach_category_id: 11,
        breach_category: {
          short_name: 'OTHER_REASON'
        }
      }]
    }
  },
  {
    dog: {
      index_number: 'ED125',
      indexNumber: 'ED125',
      breed: {
        breed: 'XL Bully'
      },
      status: 'In breach',
      dog_breaches: [{
        breach_category_id: 11,
        breach_category: {
          short_name: 'OTHER_REASON'
        }
      }]
    }
  }
]

module.exports = {
  overnightRows,
  overnightRowsInBreach
}
