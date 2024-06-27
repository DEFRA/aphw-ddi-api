const { mapSummaryCdoDaoToDto, mapCdoDaoToCdo, mapCdoDaoToExemption } = require('../../../../../app/repos/mappers/cdo')
const { buildCdoDao, buildInsuranceDao, buildRegistrationDao } = require('../../../../mocks/cdo/get')
const { buildCdo, buildExemption, buildCdoInsurance } = require('../../../../mocks/cdo/domain')

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
      expect(mapCdoDaoToExemption(exemption, insurance)).toEqual(buildExemption({
        insurance: [
          buildCdoInsurance(),
          buildCdoInsurance()
        ]
      }))
    })

    test('should map a CdoDao to an Exemption given insurance is undefined', () => {
      const exemption = buildRegistrationDao()
      const insurance = undefined
      expect(mapCdoDaoToExemption(exemption, insurance)).toEqual(buildExemption({
        insurance: undefined
      }))
    })

    test('should deserialise dates', () => {
      const registrationDao = buildRegistrationDao({
        application_pack_sent: '2024-05-01',
        cdo_expiry: '2024-05-02',
        cdo_issued: '2024-05-03',
        application_fee_paid: '2024-05-05',
        form_two_sent: '2024-05-07',
        microchip_verification: '2024-05-06',
        neutering_confirmation: '2024-05-08',
        certificate_issued: '2024-05-04'
      })
      const insurance = [buildInsuranceDao({
        id: 1,
        renewal_date: '2024-05-04'
      })]
      const mappedRegistration = mapCdoDaoToExemption(registrationDao, insurance)
      expect(mappedRegistration.applicationPackSent).toEqual(new Date('2024-05-01'))
      expect(mappedRegistration.cdoExpiry).toEqual(new Date('2024-05-02'))
      expect(mappedRegistration.cdoIssued).toEqual(new Date('2024-05-03'))
      expect(mappedRegistration.applicationFeePaid).toEqual(new Date('2024-05-05'))
      expect(mappedRegistration.formTwoSent).toEqual(new Date('2024-05-07'))
      expect(mappedRegistration.microchipVerification).toEqual(new Date('2024-05-06'))
      expect(mappedRegistration.neuteringConfirmation).toEqual(new Date('2024-05-08'))
      expect(mappedRegistration.certificateIssued).toEqual(new Date('2024-05-04'))
      expect(mappedRegistration.insurance[0].insuranceRenewal).toEqual(new Date('2024-05-04'))
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
})
