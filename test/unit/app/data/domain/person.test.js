const Person = require('../../../../../app/data/domain/person')

describe('Person', () => {
  test('should create a person', () => {
    const personProperties = {
      id: 90,
      personReference: 'P-8AD0-561A',
      firstName: 'Homer300',
      lastName: 'Simpson300',
      dateOfBirth: '1998-05-10',
      addresses: [
        {
          id: 110,
          person_id: 90,
          address_id: 110,
          created_at: '2024-06-24T09:12:07.814Z',
          deleted_at: null,
          updated_at: '2024-06-24T09:12:07.867Z',
          address: {
            id: 110,
            address_line_1: '300 Anywhere St',
            address_line_2: 'Anywhere Estate',
            town: 'City of London',
            postcode: 'S1 1AA',
            county: null,
            country_id: 1,
            created_at: '2024-06-24T09:12:07.814Z',
            deleted_at: null,
            updated_at: '2024-06-24T09:12:07.853Z',
            country: {
              id: 1,
              country: 'England'
            }
          }
        }
      ],
      person_contacts: [],
      organisationName: null
    }

    const person = new Person(personProperties)

    expect(person).toEqual(expect.objectContaining({
      id: 90,
      personReference: 'P-8AD0-561A',
      firstName: 'Homer300',
      lastName: 'Simpson300',
      dateOfBirth: '1998-05-10',
      addresses: [
        {
          id: 110,
          person_id: 90,
          address_id: 110,
          created_at: '2024-06-24T09:12:07.814Z',
          deleted_at: null,
          updated_at: '2024-06-24T09:12:07.867Z',
          address: {
            id: 110,
            address_line_1: '300 Anywhere St',
            address_line_2: 'Anywhere Estate',
            town: 'City of London',
            postcode: 'S1 1AA',
            county: null,
            country_id: 1,
            created_at: '2024-06-24T09:12:07.814Z',
            deleted_at: null,
            updated_at: '2024-06-24T09:12:07.853Z',
            country: {
              id: 1,
              country: 'England'
            }
          }
        }
      ],
      person_contacts: [],
      organisationName: null
    }))
    expect(person).toBeInstanceOf(Person)
  })
})
