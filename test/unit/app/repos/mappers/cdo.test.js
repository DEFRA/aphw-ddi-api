const { mapSummaryCdoDaoToDto } = require('../../../../../app/repos/mappers/cdo')
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
          cdoExpiry: '2024-03-01'
        }
      }

      const mappedValues = mapSummaryCdoDaoToDto(summaryCdoDao)
      expect(mappedValues).toEqual(expectedSummaryCdoDto)
    })
  })
})
