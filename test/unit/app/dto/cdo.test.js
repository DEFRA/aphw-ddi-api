const { cdoCreateDto, cdoViewDto } = require('../../../../app/dto/cdo')
const { buildDogBreachDao } = require('../../../mocks/cdo/get')

describe('CDO DTO', () => {
  test('cdoCreateDto should map cdo to cdoDto', () => {
    const cdoDao = {
      owner: {
        first_name: 'John',
        last_name: 'Smith',
        birth_date: '2000-05-20',
        person_reference: 'P-1234-5678',
        address: {
          address_line_1: '1 Test Street',
          address_line_2: 'Testarea',
          town: 'Testington',
          postcode: 'TS1 1TS',
          country: {
            country: 'England'
          }
        }
      },
      dogs: [
        {
          id: 300723,
          dog_reference: '590c1943-99b8-4c48-af20-833adfd66091',
          index_number: 'ED300723',
          dog_breed_id: 1,
          status_id: 4,
          status: { id: 4, status: 'Interim exempt', status_type: 'STANDARD' },
          name: 'Rex279',
          microchipNumber: '123451234512345',
          dog_breed: {
            active: true,
            breed: 'XL Bully',
            display_order: 1,
            id: 1
          },
          registration: {
            police_force: {
              name: 'Test Police Force'
            },
            court: {
              name: 'Test Court'
            },
            legislation_officer: 'DLO1',
            cdo_issued: '2024-05-01',
            cdo_expiry: '2024-08-01',
            joined_exemption_scheme: '2024-07-21'
          }
        }
      ]
    }

    const cdoDto = cdoCreateDto(cdoDao)

    const expectedCdo = {
      owner: {
        firstName: 'John',
        lastName: 'Smith',
        birthDate: '2000-05-20',
        personReference: 'P-1234-5678',
        address: {
          addressLine1: '1 Test Street',
          addressLine2: 'Testarea',
          town: 'Testington',
          postcode: 'TS1 1TS',
          country: 'England'
        }
      },
      enforcementDetails: {
        policeForce: 'Test Police Force',
        court: 'Test Court',
        legislationOfficer: 'DLO1'
      },
      dogs: [
        {
          indexNumber: 'ED300723',
          name: 'Rex279',
          microchipNumber: '123451234512345',
          status: 'Interim exempt',
          breed: 'XL Bully',
          cdoIssued: '2024-05-01',
          cdoExpiry: '2024-08-01',
          interimExemption: '2024-07-21'
        }
      ]
    }

    expect(cdoDto).toEqual(expectedCdo)
  })

  test('cdoCViewDto should map data to ViewDto', () => {
    const data = {
      registered_person: [
        {
          person: {
            first_name: 'John',
            last_name: 'Smith',
            birth_date: '2000-05-20',
            person_reference: 'P-1234-5678',
            addresses: [{
              address: {
                address_line_1: '1 Test Street',
                address_line_2: 'Testarea',
                town: 'Testington',
                postcode: 'TS1 1TS'
              }
            }],
            person_contacts: [{
              contact: {
                id: 123,
                contact: 'my-email@here.com'
              }
            }],
            organisation: {
              organisation_name: 'Test Org Name'
            }
          }
        }
      ],
      id: 300723,
      dog_reference: '590c1943-99b8-4c48-af20-833adfd66091',
      index_number: 'ED300723',
      status: { id: 4, status: 'Interim exempt', status_type: 'STANDARD' },
      name: 'Rex279',
      dog_breed: {
        active: true,
        breed: 'XL Bully',
        display_order: 1,
        id: 1
      },
      dog_microchips: [
        { id: 3, microchip: { id: 3, microchip_number: '123451234512345' } },
        { id: 2, microchip: { id: 2, microchip_number: '111112222233333' } }
      ],
      birth_date: '2010-02-02',
      death_date: '2024-03-03',
      tattoo: 'TATTOO123',
      colour: 'Brown',
      sex: 'Male',
      exported_date: '2024-04-04',
      stolen_date: '2024-05-05',
      untraceable_date: '2024-06-06',
      dog_breaches: [
        buildDogBreachDao({
          dog_id: 300723
        })
      ],
      registration: {
        exemption_order: {
          exemption_order: '2023'
        },
        police_force: {
          name: 'Test Police Force'
        },
        court: {
          name: 'Test Court'
        },
        legislation_officer: 'DLO1',
        cdo_issued: '2024-05-01',
        cdo_expiry: '2024-08-01',
        joined_exemption_scheme: '2024-07-21',
        certificate_issued: '2024-07-07',
        application_fee_paid: '2024-08-08',
        neutering_confirmation: '2024-09-09',
        microchip_verification: '2024-10-10',
        non_compliance_letter_sent: '2024-11-11',
        microchip_deadline: '2024-01-02',
        typed_by_dlo: '2024-02-03',
        withdrawn: '2024-12-12'
      },
      insurance: [
        { id: 2, company: { company_name: 'Insurer2' }, renewal_date: '2025-02-02' },
        { id: 1, company: { company_name: 'Insurer1' }, renewal_date: '2025-01-01' }
      ]
    }

    const cdoDto = cdoViewDto(data)

    const expectedCdoDto = {
      person: {
        firstName: 'John',
        lastName: 'Smith',
        dateOfBirth: '2000-05-20',
        personReference: 'P-1234-5678',
        addresses: [{
          address: {
            address_line_1: '1 Test Street',
            address_line_2: 'Testarea',
            town: 'Testington',
            postcode: 'TS1 1TS'
          }
        }],
        organisationName: 'Test Org Name',
        person_contacts: [{
          contact: {
            id: 123,
            contact: 'my-email@here.com'
          }
        }]
      },
      exemption: {
        exemptionOrder: '2023',
        cdoIssued: '2024-05-01',
        cdoExpiry: '2024-08-01',
        court: 'Test Court',
        policeForce: 'Test Police Force',
        legislationOfficer: 'DLO1',
        certificateIssued: '2024-07-07',
        applicationFeePaid: '2024-08-08',
        insurance: [
          { company: 'Insurer1', insuranceRenewal: '2025-01-01' },
          { company: 'Insurer2', insuranceRenewal: '2025-02-02' }
        ],
        neuteringConfirmation: '2024-09-09',
        microchipVerification: '2024-10-10',
        joinedExemptionScheme: '2024-07-21',
        nonComplianceLetterSent: '2024-11-11',
        microchipDeadline: '2024-01-02',
        neuteringDeadline: new Date(Date.UTC(2024, 5, 30)),
        typedByDlo: '2024-02-03',
        withdrawn: '2024-12-12'
      },
      dog: {
        id: 300723,
        dogReference: '590c1943-99b8-4c48-af20-833adfd66091',
        indexNumber: 'ED300723',
        name: 'Rex279',
        microchipNumber: '111112222233333',
        microchipNumber2: '123451234512345',
        status: 'Interim exempt',
        breed: 'XL Bully',
        dateOfBirth: '2010-02-02',
        dateOfDeath: '2024-03-03',
        tattoo: 'TATTOO123',
        colour: 'Brown',
        sex: 'Male',
        dateExported: '2024-04-04',
        dateStolen: '2024-05-05',
        dateUntraceable: '2024-06-06',
        breaches: ['dog away from registered address for over 30 days in one year']
      }
    }

    expect(cdoDto).toEqual(expectedCdoDto)
  })
})
