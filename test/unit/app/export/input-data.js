const validRow = {
  registered_person: [{
    person: {
      person_reference: 'P-123-456',
      first_name: 'John',
      last_name: 'Smith',
      birth_date: '2000-01-01',
      addresses: [{
        address: {
          id: 1,
          address_line_1: 'old address line 1',
          address_line_2: 'old address line 2',
          town: 'old town',
          county: 'old county',
          postcode: 'old postcode',
          country: {
            country: 'old country'
          }
        }
      },
      {
        address: {
          id: 2,
          address_line_1: 'new address line 1',
          address_line_2: 'new address line 2',
          town: 'new town',
          county: 'new county',
          postcode: 'new postcode',
          country: {
            country: 'new country'
          }
        }
      }],
      person_contacts: [
        {
          contact: {
            id: 20,
            contact_type: {
              contact_type: 'Phone'
            },
            contact: '012345678'
          }
        },
        {
          contact: {
            id: 10,
            contact_type: {
              contact_type: 'SecondaryPhone'
            },
            contact: '011111111'
          }
        },
        {
          contact: {
            id: 5,
            contact_type: {
              contact_type: 'Email'
            },
            contact: 'me@here.com'
          }
        }
      ]
    }
  }],
  dog_breed: {
    breed: 'breed1'
  },
  status: {
    status: 'TEMP_STATUS'
  },
  registration: {
    court: {
      name: 'Test court'
    },
    police_force: {
      name: 'Test police force'
    }
  },
  dog_breaches: [
    {
      breach_category: {
        label: 'owner not allowed police to read microchip'
      }
    }
  ],
  insurance: [{
    id: 1,
    company: {
      company_name: 'Insurance Company 1'
    },
    renewal_date: new Date(2024, 5, 9)
  }]
}

const validRowButMissingData = {
  registered_person: [{
    person: {
      person_reference: 'P-123-456',
      first_name: 'John',
      last_name: 'Smith',
      birth_date: '2000-01-01',
      addresses: [],
      person_contacts: []
    }
  }],
  dog_breed: {
    breed: 'breed1'
  },
  status: {
    status: 'TEMP_STATUS'
  },
  registration: {
    court: {
      name: 'Test court'
    },
    police_force: {
      name: 'Test police force'
    }
  },
  insurance: []
}

module.exports = {
  validRow,
  validRowButMissingData
}
