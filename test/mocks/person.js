/**
 * @type {PersonDao}
 */
const personDao = {
  id: 1,
  first_name: 'Luke',
  last_name: 'Skywalker',
  person_reference: 'P-6076-A37C',
  birth_date: '1951-09-25',
  addresses: [
    {
      address_id: 1,
      id: 1,
      person_id: 1,
      address: {
        id: 1,
        address_line_1: 'Moisture Farm',
        address_line_2: null,
        country: {
          id: 22,
          country: 'Tatooine'
        },
        country_id: 22,
        county: 'Mos Eisley State',
        town: 'Eisley Dunes',
        postcode: 'ME1 2FF'
      }
    }
  ],
  person_contacts: []
}

/**
 * @type {CreatedPersonDao}
 */
const createdPersonDao = {
  id: 1,
  first_name: 'Luke',
  last_name: 'Skywalker',
  person_reference: 'P-6076-A37C',
  birth_date: '1951-09-25',
  address: {
    id: 1,
    address_line_1: 'Moisture Farm',
    address_line_2: null,
    country: {
      id: 22,
      country: 'Tatooine'
    },
    country_id: 22,
    county: 'Mos Eisley State',
    town: 'Eisley Dunes',
    postcode: 'ME1 2FF'
  }
}

module.exports = {
  personDao,
  createdPersonDao
}
