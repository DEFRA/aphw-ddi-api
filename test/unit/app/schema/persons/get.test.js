const { personsFilter, personsResponse } = require('../../../../../app/schema/persons/get')

describe('getPersons schema', () => {
  describe('queryParams', () => {
    test('should validate given no filters are passed', () => {
      const queryParams = {}
      const validation = personsFilter.validate(queryParams, { abortEarly: false })

      expect(validation).toEqual({ value: {} })
      expect(validation.error).not.toBeDefined()
    })

    test('should validate given all filters are passed', () => {
      const queryParams = {
        firstName: 'firstName',
        lastName: 'lastName',
        dateOfBirth: '2000-01-01'
      }
      const expectedQueryParams = {
        firstName: 'firstName',
        lastName: 'lastName',
        dateOfBirth: new Date('2000-01-01')
      }
      const validation = personsFilter.validate(queryParams, { abortEarly: false })

      expect(validation).toEqual({ value: expectedQueryParams })
      expect(validation.error).not.toBeDefined()
    })

    test('should validate given all filters are passed with null values', () => {
      const queryParams = {
        firstName: null,
        lastName: null,
        dateOfBirth: null
      }
      const validation = personsFilter.validate(queryParams, { abortEarly: false })

      expect(validation).toEqual({ value: queryParams })
      expect(validation.error).toBeUndefined()
    })

    test('should validate given string filters are passed with empty strings', () => {
      const queryParams = {
        firstName: '',
        lastName: ''
      }
      const validation = personsFilter.validate(queryParams, { abortEarly: false })

      expect(validation).toEqual({ value: queryParams })
      expect(validation.error).toBeUndefined()
    })

    test('should validate given some filters are passed', () => {
      const queryParams = {
        firstName: 'firstName',
        lastName: 'lastName'
      }

      const validation = personsFilter.validate(queryParams, { abortEarly: false })
      expect(validation).toEqual({ value: queryParams })
      expect(validation.error).toBeUndefined()
    })

    test('should not validate if unknown filters are passed', () => {
      const queryParams = {
        firstName: 'firstName',
        lastName: 'lastName',
        unknown: 'something'
      }

      const validation = personsFilter.validate(queryParams, { abortEarly: false })
      expect(validation.error.message).toEqual('"unknown" is not allowed')
    })

    test('should not validate if date is invalid', () => {
      const queryParams = {
        dateOfBirth: '20000-13-1'
      }

      const validation = personsFilter.validate(queryParams, { abortEarly: false })
      expect(validation.error.message).toEqual('"dateOfBirth" must be in ISO 8601 date format')
    })
  })

  describe('response', () => {
    test('should return correct response schema', () => {
      const response = {
        persons: [
          {
            firstName: 'Sammy',
            lastName: 'Leannon',
            birthDate: '1998-05-10',
            address: {
              addressLine1: '0141 Kihn Village EDITED',
              addressLine2: null,
              town: 'City of London',
              postcode: 'S1 1AA',
              country: 'England'
            },
            personReference: 'P-DB0D-A045'
          }
        ]
      }

      const expectedResponse = {
        persons: [
          {
            firstName: 'Sammy',
            lastName: 'Leannon',
            birthDate: '1998-05-10',
            address: {
              addressLine1: '0141 Kihn Village EDITED',
              addressLine2: null,
              town: 'City of London',
              postcode: 'S1 1AA',
              country: 'England'
            },
            personReference: 'P-DB0D-A045'
          }
        ]
      }

      const validation = personsResponse.validate(response, { abortEarly: false })
      expect(validation.error).toBeUndefined()
      expect(validation.value).toEqual(expectedResponse)
    })
  })
})
