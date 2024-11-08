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

const overnightRowsInBreachInclExpiredInsurance = [
  {
    dog: {
      index_number: 'ED123',
      breed: {
        breed: 'XL Bully'
      },
      status: 'In breach',
      exemption_order: '2023',
      dog_breaches: [{
        breach_category_id: 11,
        breach_category: {
          short_name: 'INSURANCE_EXPIRED'
        }
      }]
    }
  },
  {
    dog: {
      index_number: 'ED125',
      breed: {
        breed: 'XL Bully'
      },
      status: 'In breach',
      exemption_order: '2023',
      dog_breaches: [{
        breach_category_id: 12,
        breach_category: {
          short_name: 'OTHER_REASON'
        }
      },
      {
        breach_category_id: 11,
        breach_category: {
          short_anme: 'INSURANCE_EXPIRED'
        }
      }]
    }
  },
  {
    dog: {
      index_number: 'ED127',
      breed: {
        breed: 'XL Bully'
      },
      status: 'In breach',
      exemption_order: '2023',
      dog_breaches: [{
        breach_category_id: 11,
        breach_category: {
          short_anme: 'INSURANCE_EXPIRED'
        }
      }]
    }
  }
]

module.exports = {
  overnightRows,
  overnightRowsInBreach,
  overnightRowsInBreachInclExpiredInsurance
}
