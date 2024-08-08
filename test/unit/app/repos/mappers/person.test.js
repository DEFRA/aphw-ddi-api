const {
  mapPersonDaoToCreatedPersonDao
} = require('../../../../../app/repos/mappers/person')

describe('person', () => {
  describe('mapPersonDaoToCreatedPersonDao', () => {
    test('should map a PersonDao to a CreatedPersonDao', () => {
      /**
       * @type {PersonDao}
       */
      const personDao = {
        id: 1,
        first_name: 'Joe',
        last_name: 'Blogs',
        birth_date: '1981-5-12',
        person_reference: 'P-1234-5678',
        addresses: [
          {
            address_id: 2,
            id: 2,
            person_id: 1,
            address: {
              id: 2,
              address_line_1: '1 Anywhere St',
              address_line_2: null,
              country_id: 1,
              county: null,
              town: 'London',
              postcode: 'L1 1AA',
              country: {
                id: 1,
                country: 'England'
              }
            }
          }
        ],
        person_contacts: [
          { contact: { id: 123, contact_type_id: 1, contact: '01912222222', contact_type: { id: 1, contact_type: 'Phone' } } },
          { contact: { id: 124, contact_type_id: 2, contact: 'myemail@here.com', contact_type: { id: 2, contact_type: 'Email' } } },
          { contact: { id: 125, contact_type_id: 3, contact: '01913333333', contact_type: { id: 3, contact_type: 'SecondaryPhone' } } }
        ]
      }
      /**
       * @type {CreatedPersonDao}
       */
      const expectedCreatedPersonDao = {
        id: 1,
        first_name: 'Joe',
        last_name: 'Blogs',
        birth_date: '1981-5-12',
        person_reference: 'P-1234-5678',
        address: {
          id: 2,
          address_line_1: '1 Anywhere St',
          address_line_2: null,
          country_id: 1,
          county: null,
          postcode: 'L1 1AA',
          town: 'London',
          country: {
            id: 1,
            country: 'England'
          }
        },
        email: 'myemail@here.com'
      }
      const createdPersonDao = mapPersonDaoToCreatedPersonDao(personDao)
      expect(createdPersonDao).toEqual(expectedCreatedPersonDao)
    })
  })
})
