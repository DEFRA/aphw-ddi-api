const { mapSummaryCdoDaoToDto, mapCdoDaoToCdo } = require('../../../../../app/repos/mappers/cdo')
const { buildCdoDao } = require('../../../../mocks/cdo/get')
const { buildCdo } = require('../../../../mocks/cdo/domain')

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

  describe('mapCdoDaoToCdo', () => {
    test('should map a CdoDao to a model', () => {
      const cdoDao = buildCdoDao()
      const expectedCdo = buildCdo()
      expect(mapCdoDaoToCdo(cdoDao)).toEqual(expectedCdo)
    })
  })
})
