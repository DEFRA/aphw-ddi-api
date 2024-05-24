const {
  mapPersonDaoToCreatedPersonDao,
  mapPersonDaoToPersonDaoWithLatestAddress
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
        person_contacts: []
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
        }
      }
      const createdPersonDao = mapPersonDaoToCreatedPersonDao(personDao)
      expect(createdPersonDao).toEqual(expectedCreatedPersonDao)
    })
  })
  describe('mapPersonDaoToPersonDaoWithLatestAddress', () => {
    test('should return only latest address from PersonDao', () => {
      const personDao =
        {
          id: 14,
          first_name: 'Harmon',
          last_name: 'Jast',
          person_reference: 'P-2359-B769',
          birth_date: '1998-05-10',
          organisation_id: null,
          created_at: '2024-05-23T19:06:29.830Z',
          deleted_at: null,
          updated_at: '2024-05-24T08:28:35.166Z',
          addresses: [
            {
              id: 15,
              person_id: 14,
              address_id: 15,
              created_at: '2024-05-23T19:06:29.830Z',
              deleted_at: null,
              updated_at: '2024-05-23T19:06:29.840Z',
              address: {
                id: 15,
                address_line_1: '95883 Abshire Radial',
                address_line_2: null,
                town: 'Tyler',
                postcode: 'S1 1AA',
                county: null,
                country_id: 1,
                created_at: '2024-05-23T19:06:29.830Z',
                deleted_at: null,
                updated_at: '2024-05-23T19:06:29.837Z',
                country: { id: 1, country: 'England' }
              }
            },
            {
              id: 21,
              person_id: 14,
              address_id: 21,
              created_at: '2024-05-24T08:28:35.144Z',
              deleted_at: null,
              updated_at: '2024-05-24T08:28:35.193Z',
              address: {
                id: 21,
                address_line_1: 'FLAT 102, MARLYN LODGE, PORTSOKEN STREET',
                address_line_2: null,
                town: 'LONDON',
                postcode: 'E1 8RB',
                county: null,
                country_id: 1,
                created_at: '2024-05-24T08:28:35.144Z',
                deleted_at: null,
                updated_at: '2024-05-24T08:28:35.187Z',
                country: { id: 1, country: 'England' }
              }
            }
          ],
          organisation: null,
          registered_people: [],
          person_contacts: []
        }

      const expectedPerson = {
        id: 14,
        first_name: 'Harmon',
        last_name: 'Jast',
        person_reference: 'P-2359-B769',
        birth_date: '1998-05-10',
        organisation_id: null,
        created_at: '2024-05-23T19:06:29.830Z',
        deleted_at: null,
        updated_at: '2024-05-24T08:28:35.166Z',
        addresses: [
          {
            id: 21,
            person_id: 14,
            address_id: 21,
            created_at: '2024-05-24T08:28:35.144Z',
            deleted_at: null,
            updated_at: '2024-05-24T08:28:35.193Z',
            address: {
              id: 21,
              address_line_1: 'FLAT 102, MARLYN LODGE, PORTSOKEN STREET',
              address_line_2: null,
              town: 'LONDON',
              postcode: 'E1 8RB',
              county: null,
              country_id: 1,
              created_at: '2024-05-24T08:28:35.144Z',
              deleted_at: null,
              updated_at: '2024-05-24T08:28:35.187Z',
              country: { id: 1, country: 'England' }
            }
          }
        ],
        organisation: null,
        registered_people: [],
        person_contacts: []
      }

      expect(mapPersonDaoToPersonDaoWithLatestAddress(personDao)).toEqual(expectedPerson)
    })
  })
})
