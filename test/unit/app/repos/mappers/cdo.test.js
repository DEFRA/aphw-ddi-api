const {
  mapPersonContactsToContactDetails,
  mapSummaryCdoDaoToDto,
  mapCdoDaoToCdo,
  mapCdoDaoToExemption,
  mapDogDaoToDog,
  mapSummaryCdoDaoToDtoWithTasks, mapCdoPersonToPerson
} = require('../../../../../app/repos/mappers/cdo')
const {
  buildCdoDao,
  buildInsuranceDao,
  buildRegistrationDao,
  buildDogDao,
  dogBreachDAOs, buildFormTwoDao, buildSummaryRegistrationDao, buildSummaryCdoDao, buildDogMicrochipDao,
  buildInsuranceCompanyDao, buildPersonDao, buildContactDao
} = require('../../../../mocks/cdo/get')
const {
  buildCdo, buildExemption, buildCdoInsurance, NOT_COVERED_BY_INSURANCE, INSECURE_PLACE,
  AWAY_FROM_ADDR_30_DAYS_IN_YR, buildCdoPerson, buildCdoPersonContactDetails
} = require('../../../../mocks/cdo/domain')
const { Exemption, ContactDetails, Person } = require('../../../../../app/data/domain')
const { buildCdoTaskDto } = require('../../../../mocks/cdo/dto')

describe('cdo mappers', () => {
  describe('mapSummaryCdoDaoToDto', () => {
    test('should map a summary cdo to a dto', () => {
      /**
       * @type {SummaryCdo}
       */
      const summaryCdoDao = {
        id: 300013,
        index_number: 'ED300013',
        status_id: 5,
        registered_person: [
          {
            id: 13,
            person: {
              id: 10,
              first_name: 'Scott',
              last_name: 'Pilgrim',
              person_reference: 'P-1234-5678'
            }
          }
        ],
        status: {
          id: 5,
          status: 'Pre-exempt',
          status_type: 'STANDARD'
        },
        registration: {
          id: 13,
          cdo_expiry: '2024-03-01',
          joined_exemption_scheme: '2023-11-01',
          non_compliance_letter_sent: '2023-11-01',
          police_force: {
            id: 5,
            name: 'Cheshire Constabulary'
          }
        }
      }
      const expectedSummaryCdoDto = {
        person: {
          id: 10,
          firstName: 'Scott',
          lastName: 'Pilgrim',
          personReference: 'P-1234-5678'
        },
        dog: {
          id: 300013,
          dogReference: 'ED300013',
          status: 'Pre-exempt'

        },
        exemption: {
          policeForce: 'Cheshire Constabulary',
          cdoExpiry: '2024-03-01',
          joinedExemptionScheme: '2023-11-01',
          nonComplianceLetterSent: '2023-11-01'
        }
      }

      const mappedValues = mapSummaryCdoDaoToDto(summaryCdoDao)
      expect(mappedValues).toEqual(expectedSummaryCdoDto)
    })

    test('should map a summary cdo with some null values to a dto', () => {
      /**
       * @type {SummaryCdo}
       */
      const summaryCdoDao = {
        id: 300013,
        index_number: 'ED300013',
        status_id: 5,
        registered_person: [
          {
            id: 13,
            person: {
              id: 10,
              first_name: 'Scott',
              last_name: 'Pilgrim',
              person_reference: 'P-1234-5678'
            }
          }
        ],
        status: {
          id: 5,
          status: 'Pre-exempt',
          status_type: 'STANDARD'
        },
        registration: {
          id: 13,
          cdo_expiry: null,
          joined_exemption_scheme: null,
          non_compliance_letter_sent: null,
          police_force: {
            id: 5,
            name: 'Cheshire Constabulary'
          }
        }
      }
      const expectedSummaryCdoDto = {
        person: {
          id: 10,
          firstName: 'Scott',
          lastName: 'Pilgrim',
          personReference: 'P-1234-5678'
        },
        dog: {
          id: 300013,
          dogReference: 'ED300013',
          status: 'Pre-exempt'

        },
        exemption: {
          policeForce: 'Cheshire Constabulary',
          cdoExpiry: null,
          joinedExemptionScheme: null,
          nonComplianceLetterSent: null
        }
      }

      const mappedValues = mapSummaryCdoDaoToDto(summaryCdoDao)
      expect(mappedValues).toEqual(expectedSummaryCdoDto)
    })
  })

  describe('mapSummaryCdoDaoToDtoWithTasks', () => {
    test('should map a summary cdo to a dto', () => {
      /**
       * @type {SummaryCdo}
       */
      const summaryCdoDao = buildSummaryCdoDao({
        id: 300013,
        index_number: 'ED300013',
        status_id: 5,
        registered_person: [
          {
            id: 13,
            person: {
              id: 10,
              first_name: 'Scott',
              last_name: 'Pilgrim',
              person_reference: 'P-1234-5678'
            }
          }
        ],
        status: {
          id: 5,
          status: 'Pre-exempt',
          status_type: 'STANDARD'
        },
        registration: buildSummaryRegistrationDao({
          id: 13,
          cdo_expiry: '2024-03-01',
          joined_exemption_scheme: '2023-11-01',
          non_compliance_letter_sent: '2023-11-01',
          police_force: {
            id: 5,
            name: 'Cheshire Constabulary'
          }
        })
      })

      const expectedSummaryCdoDto = {
        person: {
          id: 10,
          firstName: 'Scott',
          lastName: 'Pilgrim',
          personReference: 'P-1234-5678'
        },
        dog: {
          id: 300013,
          dogReference: 'ED300013',
          status: 'Pre-exempt'
        },
        exemption: {
          policeForce: 'Cheshire Constabulary',
          cdoExpiry: '2024-03-01',
          joinedExemptionScheme: '2023-11-01',
          nonComplianceLetterSent: '2023-11-01'
        }
      }

      const expectedTaskList = [
        buildCdoTaskDto({
          key: 'applicationPackSent',
          available: true,
          completed: false,
          readonly: false,
          timestamp: undefined
        }),
        buildCdoTaskDto({
          key: 'applicationPackProcessed'
        }),
        buildCdoTaskDto({
          key: 'insuranceDetailsRecorded'
        }),
        buildCdoTaskDto({
          key: 'applicationFeePaid'
        }),
        buildCdoTaskDto({
          key: 'form2Sent'
        }),
        buildCdoTaskDto({
          key: 'verificationDateRecorded'
        })
      ]

      const mappedValues = mapSummaryCdoDaoToDtoWithTasks(summaryCdoDao)
      expect(mappedValues).toEqual(expect.objectContaining(expectedSummaryCdoDto))
      expect(mappedValues.exemption).toEqual(expectedSummaryCdoDto.exemption)
      expect(mappedValues.person).toEqual(expectedSummaryCdoDto.person)
      expect(mappedValues.dog).toEqual(expectedSummaryCdoDto.dog)
      expect(mappedValues.taskList).toEqual(expectedTaskList)
    })

    test('should map a summary cdo with some null values to a dto', () => {
      /**
       * @type {SummaryCdo}
       */
      const summaryCdoDao = buildSummaryCdoDao({
        id: 300013,
        index_number: 'ED300013',
        status_id: 5,
        registered_person: [
          {
            id: 13,
            person: {
              id: 10,
              first_name: 'Scott',
              last_name: 'Pilgrim',
              person_reference: 'P-1234-5678'
            }
          }
        ],
        status: {
          id: 5,
          status: 'Pre-exempt',
          status_type: 'STANDARD'
        },
        registration: buildSummaryRegistrationDao({
          id: 13,
          cdo_expiry: null,
          joined_exemption_scheme: null,
          non_compliance_letter_sent: null,
          police_force: {
            id: 5,
            name: 'Cheshire Constabulary'
          }
        })
      })
      const expectedSummaryCdoDto = {
        person: {
          id: 10,
          firstName: 'Scott',
          lastName: 'Pilgrim',
          personReference: 'P-1234-5678'
        },
        dog: {
          id: 300013,
          dogReference: 'ED300013',
          status: 'Pre-exempt'

        },
        exemption: {
          policeForce: 'Cheshire Constabulary',
          cdoExpiry: null,
          joinedExemptionScheme: null,
          nonComplianceLetterSent: null
        },
        taskList: expect.any(Array)
      }

      const mappedValues = mapSummaryCdoDaoToDtoWithTasks(summaryCdoDao)
      expect(mappedValues).toEqual(expectedSummaryCdoDto)
    })

    test('should map a summary cdo with tasks to do', () => {
      /**
       * @type {SummaryCdo}
       */
      const summaryCdoDao = buildSummaryCdoDao({
        id: 300013,
        index_number: 'ED300013',
        status_id: 5,
        dog_microchips: [
          buildDogMicrochipDao({
            microchip: '123456789012345'
          })
        ],
        registered_person: [
          {
            id: 13,
            person: {
              id: 10,
              first_name: 'Scott',
              last_name: 'Pilgrim',
              person_reference: 'P-1234-5678'
            }
          }
        ],
        insurance: [
          buildInsuranceDao({
            renewal_date: new Date('9999-12-19'),
            company: buildInsuranceCompanyDao({
              company_name: 'Dog\'s Trust'
            })
          })
        ],
        status: {
          id: 5,
          status: 'Pre-exempt',
          status_type: 'STANDARD'
        },
        registration: buildSummaryRegistrationDao({
          id: 13,
          cdo_expiry: '2024-03-01',
          joined_exemption_scheme: '2023-11-01',
          non_compliance_letter_sent: '2023-11-01',
          application_pack_sent: new Date('2024-12-19'),
          application_pack_processed: new Date('2024-12-19'),
          form_two_sent: new Date('2024-12-19'),
          insurance_details_recorded: new Date('2024-12-19'),
          microchip_number_recorded: new Date('2024-12-19'),
          microchip_verification: new Date('2024-12-19'),
          neutering_confirmation: new Date('2024-12-19'),
          verification_dates_recorded: new Date('2024-12-19'),
          application_fee_paid: new Date('2024-12-19'),
          application_fee_payment_recorded: new Date('2024-12-19'),
          police_force: {
            id: 5,
            name: 'Cheshire Constabulary'
          }
        })
      })

      const expectedSummaryCdoDto = {
        person: {
          id: 10,
          firstName: 'Scott',
          lastName: 'Pilgrim',
          personReference: 'P-1234-5678'
        },
        dog: {
          id: 300013,
          dogReference: 'ED300013',
          status: 'Pre-exempt'
        },
        exemption: {
          policeForce: 'Cheshire Constabulary',
          cdoExpiry: '2024-03-01',
          joinedExemptionScheme: '2023-11-01',
          nonComplianceLetterSent: '2023-11-01'
        },
        taskList: [
          buildCdoTaskDto({
            key: 'applicationPackSent',
            available: true,
            completed: true,
            readonly: true,
            timestamp: '2024-12-19T00:00:00.000Z'
          }),
          buildCdoTaskDto({
            key: 'applicationPackProcessed',
            available: true,
            completed: true,
            readonly: true,
            timestamp: '2024-12-19T00:00:00.000Z'
          }),
          buildCdoTaskDto({
            key: 'insuranceDetailsRecorded',
            available: true,
            completed: true,
            timestamp: '2024-12-19T00:00:00.000Z'
          }),
          buildCdoTaskDto({
            key: 'applicationFeePaid',
            available: true,
            completed: true,
            timestamp: '2024-12-19T00:00:00.000Z'
          }),
          buildCdoTaskDto({
            key: 'form2Sent',
            available: true,
            completed: true,
            readonly: true,
            timestamp: '2024-12-19T00:00:00.000Z'
          }),
          buildCdoTaskDto({
            key: 'verificationDateRecorded',
            completed: true,
            available: true,
            timestamp: '2024-12-19T00:00:00.000Z'
          })
        ]

      }

      const mappedValues = mapSummaryCdoDaoToDtoWithTasks(summaryCdoDao)
      expect(mappedValues).toEqual(expectedSummaryCdoDto)
    })
  })

  describe('mapPersonContactsToContactDetails', () => {
    test('should map contacts', () => {
      const personContacts = [
        {
          id: 300307,
          person_id: 100145,
          contact_id: 300307,
          created_at: '2025-01-07T12:52:54.823Z',
          deleted_at: null,
          updated_at: '2025-01-07T12:52:54.997Z',
          contact: {
            id: 300307,
            contact: 'sherlock@holmes1.co.uk',
            contact_type_id: 2,
            created_at: '2025-01-07T12:52:54.823Z',
            deleted_at: null,
            updated_at: '2025-01-07T12:52:54.993Z',
            contact_type: { id: 2, contact_type: 'Email' }
          }
        },
        {
          id: 300307,
          person_id: 100145,
          contact_id: 300307,
          created_at: '2025-01-07T12:52:54.823Z',
          deleted_at: null,
          updated_at: '2025-01-07T12:52:54.997Z',
          contact: undefined
        },
        {
          id: 300308,
          person_id: 100145,
          contact_id: 300308,
          created_at: '2025-01-07T12:52:54.823Z',
          deleted_at: null,
          updated_at: '2025-01-07T12:52:55.005Z',
          contact: {
            id: 300308,
            contact: '',
            contact_type_id: 1,
            created_at: '2025-01-07T12:52:54.823Z',
            deleted_at: null,
            updated_at: '2025-01-07T12:52:55.003Z',
            contact_type: { id: 1, contact_type: 'Phone' }
          }
        },
        {
          id: 300309,
          person_id: 100145,
          contact_id: 300309,
          created_at: '2025-01-07T12:52:54.823Z',
          deleted_at: null,
          updated_at: '2025-01-07T12:52:55.016Z',
          contact: {
            id: 300309,
            contact: '',
            contact_type_id: 3,
            created_at: '2025-01-07T12:52:54.823Z',
            deleted_at: null,
            updated_at: '2025-01-07T12:52:55.011Z',
            contact_type: { id: 3, contact_type: 'SecondaryPhone' }
          }
        },
        {
          id: 300310,
          person_id: 100145,
          contact_id: 300310,
          created_at: '2025-01-07T13:05:12.500Z',
          deleted_at: null,
          updated_at: '2025-01-07T13:05:12.674Z',
          contact: {
            id: 300310,
            contact: 'sherlock2@holmes.co.uk',
            contact_type_id: 2,
            created_at: '2025-01-07T13:05:12.500Z',
            deleted_at: null,
            updated_at: '2025-01-07T13:05:12.668Z',
            contact_type: { id: 2, contact_type: 'Email' }
          }
        },
        {
          id: 300311,
          person_id: 100145,
          contact_id: 300311,
          created_at: '2025-01-07T13:05:21.533Z',
          deleted_at: null,
          updated_at: '2025-01-07T13:05:21.669Z',
          contact: {
            id: 300311,
            contact: 'sherlock@holmes.co.uk',
            contact_type_id: 2,
            created_at: '2025-01-07T13:05:21.533Z',
            deleted_at: null,
            updated_at: '2025-01-07T13:05:21.666Z',
            contact_type: { id: 2, contact_type: 'Email' }
          }
        }]
      const contactDetails = mapPersonContactsToContactDetails(personContacts)
      expect(contactDetails).toBeInstanceOf(ContactDetails)
      expect(contactDetails.phone).toBe(undefined)
      expect(contactDetails.email).toBe('sherlock@holmes.co.uk')
    })

    test('should map null contacts', () => {
      const personContacts = []
      const contactDetails = mapPersonContactsToContactDetails(personContacts)
      expect(contactDetails).toBeInstanceOf(ContactDetails)
    })
  })

  describe('mapCdoPersonToPerson', () => {
    test('should map a cdo person to a person', () => {
      const personContacts = [buildContactDao()]
      const personDao = buildPersonDao({
        person_contacts: personContacts
      })
      const expectedPerson = new Person(buildCdoPerson({
        person_contacts: personContacts,
        contactDetails: buildCdoPersonContactDetails({
          email: 'alex@carter.co.uk'
        })

      }))
      const person = mapCdoPersonToPerson(personDao)
      expect(person).toEqual(expectedPerson)
      expect(person.contactDetails.email).toEqual('alex@carter.co.uk')
    })
  })

  describe('mapCdoDaoToExemption', () => {
    test('should map a CdoDao to an Exemption', () => {
      const exemption = buildRegistrationDao()
      const insurance = [
        buildInsuranceDao({
          id: 1
        }),
        buildInsuranceDao({
          id: 0
        })
      ]
      expect(mapCdoDaoToExemption(exemption, insurance)).toEqual(new Exemption(buildExemption({
        insurance: [
          buildCdoInsurance(),
          buildCdoInsurance()
        ]
      })))
    })

    test('should map a CdoDao to an Exemption given insurance is undefined', () => {
      const exemption = buildRegistrationDao()
      const insurance = undefined
      expect(mapCdoDaoToExemption(exemption, insurance)).toEqual(new Exemption(buildExemption({
        insurance: undefined
      })))
    })

    test('should map a CdoDao to an Exemption given form 2 is submitted', () => {
      const exemption = buildRegistrationDao({
        form_two: buildFormTwoDao({
          form_two_submitted: new Date('2024-12-07')
        })
      })
      expect(mapCdoDaoToExemption(exemption, undefined)).toEqual(new Exemption(buildExemption({
        insurance: undefined,
        form2Submitted: new Date('2024-12-07')
      })))
    })

    test('should deserialise dates', () => {
      const registrationDao = buildRegistrationDao({
        application_pack_sent: '2024-05-01',
        application_pack_processed: '2024-05-01',
        cdo_expiry: '2024-05-02',
        cdo_issued: '2024-05-03',
        application_fee_paid: '2024-05-05',
        form_two_sent: '2024-05-07',
        microchip_verification: '2024-05-06',
        microchip_deadline: '2024-05-06',
        neutering_confirmation: '2024-05-08',
        neutering_deadline: '2024-05-08',
        insurance_details_recorded: '2024-05-08',
        microchip_number_recorded: '2024-05-08',
        application_fee_payment_recorded: '2024-05-08',
        verification_dates_recorded: '2024-05-08',
        certificate_issued: '2024-05-04'
      })
      const insurance = [buildInsuranceDao({
        id: 1,
        renewal_date: '2024-05-04'
      })]
      const mappedRegistration = mapCdoDaoToExemption(registrationDao, insurance)
      expect(mappedRegistration.applicationPackSent).toEqual(new Date('2024-05-01'))
      expect(mappedRegistration.applicationPackProcessed).toEqual(new Date('2024-05-01'))
      expect(mappedRegistration.cdoExpiry).toEqual(new Date('2024-05-02'))
      expect(mappedRegistration.cdoIssued).toEqual(new Date('2024-05-03'))
      expect(mappedRegistration.applicationFeePaid).toEqual(new Date('2024-05-05'))
      expect(mappedRegistration.form2Sent).toEqual(new Date('2024-05-07'))
      expect(mappedRegistration.microchipVerification).toEqual(new Date('2024-05-06'))
      expect(mappedRegistration.microchipDeadline).toEqual(new Date('2024-05-06'))
      expect(mappedRegistration.neuteringConfirmation).toEqual(new Date('2024-05-08'))
      expect(mappedRegistration.neuteringDeadline).toEqual(new Date('2024-05-08'))
      expect(mappedRegistration.certificateIssued).toEqual(new Date('2024-05-04'))
      expect(mappedRegistration.insurance[0].renewalDate).toEqual(new Date('2024-05-04'))
      expect(mappedRegistration.insuranceDetailsRecorded).toEqual(new Date('2024-05-08'))
      expect(mappedRegistration.microchipNumberRecorded).toEqual(new Date('2024-05-08'))
      expect(mappedRegistration.applicationFeePaymentRecorded).toEqual(new Date('2024-05-08'))
      expect(mappedRegistration.verificationDatesRecorded).toEqual(new Date('2024-05-08'))
    })
  })

  describe('mapCdoDaoToCdo', () => {
    test('should map a CdoDao to a model', () => {
      const cdoDao = buildCdoDao()
      const expectedCdo = buildCdo()
      expect(mapCdoDaoToCdo(cdoDao)).toEqual(expectedCdo)
    })

    test('should map a CdoDao to a model with insurance', () => {
      const cdoDao = buildCdoDao({
        insurance: [
          buildInsuranceDao({
            id: 1
          }),
          buildInsuranceDao({
            id: 0
          })
        ]
      })
      const expectedCdo = buildCdo({
        exemption: buildExemption({
          insurance: [
            buildCdoInsurance(),
            buildCdoInsurance()
          ]
        })
      })
      expect(mapCdoDaoToCdo(cdoDao)).toEqual(expectedCdo)
    })
  })

  describe('mapDogDaoToDog', () => {
    test('should map dogDao to Dog', () => {
      const dogDao = buildDogDao({
        birth_date: '2024-10-11',
        death_date: '2024-10-11',
        exported_date: '2024-10-11',
        stolen_date: '2024-10-11',
        untraceable_date: '2024-10-11'
      })
      const dog = mapDogDaoToDog(dogDao)
      expect(dog.dateOfBirth).toEqual(new Date('2024-10-11'))
      expect(dog.dateOfDeath).toEqual(new Date('2024-10-11'))
      expect(dog.dateStolen).toEqual(new Date('2024-10-11'))
      expect(dog.dateUntraceable).toEqual(new Date('2024-10-11'))
    })

    test('should map dog breaches', () => {
      const dogDao = buildDogDao({
        dog_breaches: dogBreachDAOs
      })
      const expectedBreachCategories = [
        NOT_COVERED_BY_INSURANCE,
        INSECURE_PLACE,
        AWAY_FROM_ADDR_30_DAYS_IN_YR
      ]
      const dog = mapDogDaoToDog(dogDao)
      expect(dog.breaches).toEqual(expectedBreachCategories)
    })
  })
})
