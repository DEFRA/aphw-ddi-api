const { mapPersonAndDogsByIndexDao, personDto } = require('../../../../app/dto/person')
describe('mapPersonAndDogsByIndexDao', () => {
  test('should map PersonAndDogsByIndexDao to a PersonAndDogsDto', () => {
    /**
     * @type {PersonAndDogsByIndexDao}
     */
    const personAndDogsByIndexDao = {
      dog_id: 1,
      id: 1,
      person: {
        birth_date: '1998-05-10',
        first_name: 'Ralph',
        id: 2,
        last_name: 'Wreck it',
        person_contacts: [
          { id: 2, contact: { id: 2, contact_type: { contact_type: 'Email' }, contact: 'email2@here.com' } },
          { id: 3, contact: { id: 3, contact_type: { contact_type: 'Email' }, contact: 'email3@here.com' } },
          { id: 1, contact: { id: 1, contact_type: { contact_type: 'Email' }, contact: 'email1@here.com' } },
          { id: 5, contact: { id: 5, contact_type: { contact_type: 'Phone' }, contact: '01915555555' } },
          { id: 6, contact: { id: 6, contact_type: { contact_type: 'Phone' }, contact: '01916666666' } },
          { id: 4, contact: { id: 4, contact_type: { contact_type: 'Phone' }, contact: '01914444444' } },
          { id: 8, contact: { id: 8, contact_type: { contact_type: 'SecondaryPhone' }, contact: '01918888888' } },
          { id: 9, contact: { id: 9, contact_type: { contact_type: 'SecondaryPhone' }, contact: '01919999999' } },
          { id: 7, contact: { id: 7, contact_type: { contact_type: 'SecondaryPhone' }, contact: '01917777777' } }
        ],
        person_reference: 'P-1234-567',
        registered_people: [
          {
            dog_id: 1,
            id: 1,
            person_id: 2,
            person_type_id: 1,
            dog: {
              id: 300723,
              dog_reference: '590c1943-99b8-4c48-af20-833adfd66091',
              index_number: 'ED300723',
              dog_breed_id: 1,
              status_id: 4,
              status: { id: 4, status: 'Interim exempt', status_type: 'STANDARD' },
              name: 'Rex279',
              dog_breed: {
                active: true,
                breed: 'XL Bully',
                display_order: 1,
                id: 1
              },
              dog_microchips: [],
              birth_date: null,
              death_date: null,
              tattoo: null,
              colour: null,
              sex: null,
              exported_date: null,
              stolen_date: null,
              untraceable_date: null
            }
          },
          {
            dog_id: 2,
            id: 2,
            person_id: 2,
            person_type_id: 1,
            dog: {
              id: 300724,
              dog_reference: '590c1943-99b8-4c48-af20-833adfd66091',
              index_number: 'ED300724',
              dog_breed_id: 1,
              dog_breed: {
                active: true,
                breed: 'XL Bully',
                display_order: 1,
                id: 1
              },
              status_id: 4,
              status: { id: 4, status: 'Interim exempt', status_type: 'STANDARD' },
              name: 'Rex280',
              birth_date: null,
              death_date: null,
              tattoo: null,
              colour: null,
              sex: null,
              exported_date: null,
              stolen_date: null,
              untraceable_date: null,
              dog_microchips: [
                {
                  dog_id: 300724, id: 1, microchip: { microchip_number: '123456789012345' }, microchip_id: 1
                },
                {
                  dog_id: 300724, id: 2, microchip: { microchip_number: '234567890123456' }, microchip_id: 2
                }
              ]
            }
          }
        ],
        addresses: [
          {
            address_id: 0,
            id: 0,
            person_id: 0,
            address: {
              address_line_1: 'Flat 3, 4, Johnsons Court',
              address_line_2: null,
              country: { id: 1, country: 'England' },
              country_id: 0,
              county: 'Greater London',
              id: 0,
              postcode: 'EC4A 3EA',
              town: 'London'
            }
          }
        ]
      },
      person_id: 0,
      person_type_id: 0,
      dog: undefined
    }

    const personAndDogsDto = mapPersonAndDogsByIndexDao(personAndDogsByIndexDao)

    /**
     * @type {PersonAndDogsDto}
     */
    const expectedPersonAndDogs = {
      birthDate: '1998-05-10',
      contacts: [
        { id: 2, contact: { id: 2, contact_type: { contact_type: 'Email' }, contact: 'email2@here.com' } },
        { id: 3, contact: { id: 3, contact_type: { contact_type: 'Email' }, contact: 'email3@here.com' } },
        { id: 1, contact: { id: 1, contact_type: { contact_type: 'Email' }, contact: 'email1@here.com' } },
        { id: 5, contact: { id: 5, contact_type: { contact_type: 'Phone' }, contact: '01915555555' } },
        { id: 6, contact: { id: 6, contact_type: { contact_type: 'Phone' }, contact: '01916666666' } },
        { id: 4, contact: { id: 4, contact_type: { contact_type: 'Phone' }, contact: '01914444444' } },
        { id: 8, contact: { id: 8, contact_type: { contact_type: 'SecondaryPhone' }, contact: '01918888888' } },
        { id: 9, contact: { id: 9, contact_type: { contact_type: 'SecondaryPhone' }, contact: '01919999999' } },
        { id: 7, contact: { id: 7, contact_type: { contact_type: 'SecondaryPhone' }, contact: '01917777777' } }
      ],
      dogs: [
        {
          id: 300723,
          indexNumber: 'ED300723',
          dogReference: '590c1943-99b8-4c48-af20-833adfd66091',
          microchipNumber: null,
          microchipNumber2: null,
          breed: 'XL Bully',
          name: 'Rex279',
          status: 'Interim exempt',
          birthDate: null,
          tattoo: null,
          colour: null,
          sex: null
        },
        {
          id: 300724,
          indexNumber: 'ED300724',
          dogReference: '590c1943-99b8-4c48-af20-833adfd66091',
          microchipNumber: '123456789012345',
          microchipNumber2: '234567890123456',
          breed: 'XL Bully',
          name: 'Rex280',
          status: 'Interim exempt',
          birthDate: null,
          tattoo: null,
          colour: null,
          sex: null
        }
      ],
      firstName: 'Ralph',
      lastName: 'Wreck it',
      organisationName: undefined,
      personReference: 'P-1234-567',
      address: {
        addressLine1: 'Flat 3, 4, Johnsons Court',
        addressLine2: null,
        country: 'England',
        postcode: 'EC4A 3EA',
        town: 'London'
      }
    }

    expect(personAndDogsDto).toEqual(expectedPersonAndDogs)
  })

  test('should map Person to a PersonDto returning multiple contacts', () => {
    const person = {
      birth_date: '1998-05-10',
      first_name: 'Ralph',
      last_name: 'Wreck it',
      person_contacts: [
        { id: 2, contact: { id: 2, contact_type: { contact_type: 'Email' }, contact: 'email2@here.com' } },
        { id: 3, contact: { id: 3, contact_type: { contact_type: 'Email' }, contact: 'email3@here.com' } },
        { id: 1, contact: { id: 1, contact_type: { contact_type: 'Email' }, contact: 'email1@here.com' } },
        { id: 5, contact: { id: 5, contact_type: { contact_type: 'Phone' }, contact: '01915555555' } },
        { id: 6, contact: { id: 6, contact_type: { contact_type: 'Phone' }, contact: '01916666666' } },
        { id: 4, contact: { id: 4, contact_type: { contact_type: 'Phone' }, contact: '01914444444' } },
        { id: 8, contact: { id: 8, contact_type: { contact_type: 'SecondaryPhone' }, contact: '01918888888' } },
        { id: 9, contact: { id: 9, contact_type: { contact_type: 'SecondaryPhone' }, contact: '01919999999' } },
        { id: 7, contact: { id: 7, contact_type: { contact_type: 'SecondaryPhone' }, contact: '01917777777' } }
      ],
      person_reference: 'P-1234-567',
      addresses: [
        {
          address_id: 0,
          id: 0,
          person_id: 0,
          address: {
            address_line_1: 'Flat 3, 4, Johnsons Court',
            address_line_2: null,
            country: { id: 1, country: 'England' },
            country_id: 0,
            county: 'Greater London',
            id: 0,
            postcode: 'EC4A 3EA',
            town: 'London'
          }
        }
      ]
    }

    const personRes = personDto(person, false)

    const expectedPerson = {
      birthDate: '1998-05-10',
      contacts: {
        emails: [
          'email3@here.com',
          'email2@here.com',
          'email1@here.com'
        ],
        primaryTelephones: [
          '01916666666',
          '01915555555',
          '01914444444'
        ],
        secondaryTelephones: [
          '01919999999',
          '01918888888',
          '01917777777'
        ]
      },
      firstName: 'Ralph',
      lastName: 'Wreck it',
      organisationName: undefined,
      personReference: 'P-1234-567',
      address: {
        addressLine1: 'Flat 3, 4, Johnsons Court',
        addressLine2: null,
        country: 'England',
        postcode: 'EC4A 3EA',
        town: 'London'
      }
    }

    expect(personRes).toEqual(expectedPerson)
  })

  test('should map Person to a PersonDto returning latest contacts', () => {
    const person = {
      birth_date: '1998-05-10',
      first_name: 'Ralph',
      last_name: 'Wreck it',
      person_contacts: [
        { id: 2, contact: { id: 2, contact_type: { contact_type: 'Email' }, contact: 'email2@here.com' } },
        { id: 3, contact: { id: 3, contact_type: { contact_type: 'Email' }, contact: 'email3@here.com' } },
        { id: 1, contact: { id: 1, contact_type: { contact_type: 'Email' }, contact: 'email1@here.com' } },
        { id: 5, contact: { id: 5, contact_type: { contact_type: 'Phone' }, contact: '01915555555' } },
        { id: 6, contact: { id: 6, contact_type: { contact_type: 'Phone' }, contact: '01916666666' } },
        { id: 4, contact: { id: 4, contact_type: { contact_type: 'Phone' }, contact: '01914444444' } },
        { id: 8, contact: { id: 8, contact_type: { contact_type: 'SecondaryPhone' }, contact: '01918888888' } },
        { id: 9, contact: { id: 9, contact_type: { contact_type: 'SecondaryPhone' }, contact: '01919999999' } },
        { id: 7, contact: { id: 7, contact_type: { contact_type: 'SecondaryPhone' }, contact: '01917777777' } }
      ],
      person_reference: 'P-1234-567',
      addresses: [
        {
          address_id: 0,
          id: 0,
          person_id: 0,
          address: {
            address_line_1: 'Flat 3, 4, Johnsons Court',
            address_line_2: null,
            country: { id: 1, country: 'England' },
            country_id: 0,
            county: 'Greater London',
            id: 0,
            postcode: 'EC4A 3EA',
            town: 'London'
          }
        }
      ]
    }

    const personRes = personDto(person, true)

    const expectedPerson = {
      birthDate: '1998-05-10',
      contacts: {
        email: 'email3@here.com',
        primaryTelephone: '01916666666',
        secondaryTelephone: '01919999999'
      },
      firstName: 'Ralph',
      lastName: 'Wreck it',
      organisationName: undefined,
      personReference: 'P-1234-567',
      address: {
        addressLine1: 'Flat 3, 4, Johnsons Court',
        addressLine2: null,
        country: 'England',
        postcode: 'EC4A 3EA',
        town: 'London'
      }
    }

    expect(personRes).toEqual(expectedPerson)
  })
})
