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
        breed: 'Breed'
      },
      status: 'In breach',
      exemption_order: '1991',
      dog_breaches: [{
        breach_category_id: 12,
        breach_category: {
          short_name: 'OTHER'
        }
      }]
    }
  },
  {
    dog: {
      index_number: 'ED125',
      breed: {
        breed: 'Breed'
      },
      status: 'In breach',
      exemption_order: '1991',
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
        breed: 'Breed'
      },
      status: 'In breach',
      exemption_order: '1991',
      dog_breaches: [{
        breach_category_id: 11,
        breach_category: {
          short_anme: 'INSURANCE_EXPIRED'
        }
      }]
    }
  }
]

const overnightRowsInBreachExclExpiredInsurance = [
  {
    dog: {
      index_number: 'ED123',
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
        breach_category_id: 12,
        breach_category: {
          short_anme: 'OTHER_REASON'
        }
      }]
    }
  }
]

const overnightRowsWithNeuteringDeadline = [
  {
    dog: {
      index_number: 'ED123',
      status: {
        status: 'In breach'
      },
      dog_breaches: [{
        breach_category_id: 12,
        breach_category: {
          short_name: 'NEUTERING_DEADLINE_EXCEEDED'
        }
      }],
      exemption: {
        neutering_deadline: new Date(2024, 9, 10)
      }
    },
    exemption_order: {
      exemption_order: '2023'
    }
  },
  {
    dog: {
      index_number: 'ED124',
      status: {
        status: 'In breach'
      },
      dog_breaches: [{
        breach_category_id: 11,
        breach_category: {
          short_name: 'INSURANCE_EXPIRED'
        }
      }],
      exemption: {
        neutering_deadline: new Date(2024, 9, 15)
      }
    },
    exemption_order: {
      exemption_order: '2023'
    }
  },
  {
    dog: {
      index_number: 'ED125',
      status: {
        status: 'In breach'
      },
      dog_breaches: [{
        breach_category_id: 15,
        breach_category: {
          short_name: 'OTHER_REASON'
        }
      }],
      exemption: {
        neutering_deadline: new Date(2024, 9, 20)
      }
    },
    exemption_order: {
      exemption_order: '2023'
    }
  },
  {
    dog: {
      index_number: 'ED126',
      status: {
        status: 'Exempt'
      },
      dog_breaches: [],
      exemption: {
        neutering_deadline: new Date(2024, 9, 25)
      }
    },
    exemption_order: {
      exemption_order: '2023'
    }
  },
  {
    dog: {
      index_number: 'ED127',
      status: {
        status: 'Exempt'
      },
      dog_breaches: [],
      exemption: {
        neutering_deadline: new Date(2024, 9, 26)
      }
    },
    exemption_order: {
      exemption_order: '1991'
    }
  }
]

const overnightRowsWithMicrochipDeadline = [
  {
    dog: {
      index_number: 'ED123',
      status: {
        status: 'In breach'
      },
      dog_breaches: [{
        breach_category_id: 16,
        breach_category: {
          short_name: 'MICROCHIP_DEADLINE_EXCEEDED'
        }
      }],
      exemption: {
        microchip_deadline: new Date(2024, 9, 10)
      }
    }
  },
  {
    dog: {
      index_number: 'ED124',
      status: {
        status: 'In breach'
      },
      dog_breaches: [{
        breach_category_id: 11,
        breach_category: {
          short_name: 'INSURANCE_EXPIRED'
        }
      }],
      exemption: {
        microchip_deadline: new Date(2024, 9, 15)
      }
    }
  },
  {
    dog: {
      index_number: 'ED125',
      status: {
        status: 'In breach'
      },
      dog_breaches: [{
        breach_category_id: 15,
        breach_category: {
          short_name: 'OTHER_REASON'
        }
      }],
      exemption: {
        microchip_deadline: new Date(2024, 9, 20)
      }
    }
  },
  {
    dog: {
      index_number: 'ED126',
      status: {
        status: 'Exempt'
      },
      dog_breaches: [],
      exemption: {
        microchip_deadline: new Date(2024, 9, 25)
      }
    }
  }
]

module.exports = {
  overnightRows,
  overnightRowsInBreach,
  overnightRowsInBreachInclExpiredInsurance,
  overnightRowsInBreachExclExpiredInsurance,
  overnightRowsWithNeuteringDeadline,
  overnightRowsWithMicrochipDeadline
}
