const { getCdosQuerySchema, getCdosResponseSchema } = require('../../../../../app/schema/cdos/get')
describe('cdos - GET schema', () => {
  describe('query', () => {
    test('should validate if correct filters are passed', () => {
      const queryParams = {
        status: 'PreExempt',
        withinDays: '30'
      }

      const validation = getCdosQuerySchema.validate(queryParams, { abortEarly: false })
      const expectedQueryParams = {
        status: ['PreExempt'],
        withinDays: 30
      }

      expect(validation).toEqual({ value: expectedQueryParams })
      expect(validation.error).not.toBeDefined()
    })

    test('should validate if array of status is passed', () => {
      const queryParams = {
        status: ['PreExempt', 'InterimExempt'],
        withinDays: '30'
      }

      const validation = getCdosQuerySchema.validate(queryParams, { abortEarly: false })
      const expectedQueryParams = {
        status: ['PreExempt', 'InterimExempt'],
        withinDays: 30
      }

      expect(validation).toEqual({ value: expectedQueryParams })
      expect(validation.error).not.toBeDefined()
    })

    test('should not validate if unknown filters are passed', () => {
      const queryParams = {
        unknown: 'something',
        status: 'PreExempt',
        withinDays: '30'
      }

      const validation = getCdosQuerySchema.validate(queryParams, { abortEarly: false })
      expect(validation.error.message).toEqual('"unknown" is not allowed')
    })

    test('should not validate if no filters are passed', () => {
      const queryParams = {}

      const validation = getCdosQuerySchema.validate(queryParams, { abortEarly: false })
      expect(validation.error.message).toEqual('"value" must contain at least one of [withinDays, status]')
    })
  })

  describe('response', () => {
    test('should validate with results returns', () => {
      const response = {
        cdos: [
          {
            person: {
              id: 10,
              firstName: 'Scott',
              lastName: 'Pilgrim',
              personReference: 'P-2655-0A37'
            },
            dog: {
              id: 1,
              dogReference: 'ED300001',
              status: 'Pre-exempt'
            },
            exemption: {
              policeForce: 'Cheshire Constabulary',
              cdoExpiry: '2024-03-01'
            }
          }
        ]
      }

      const validation = getCdosResponseSchema.validate(response, { abortEarly: false })
      const expectedResponseValues = {
        cdos: [
          {
            person: {
              id: 10,
              firstName: 'Scott',
              lastName: 'Pilgrim',
              personReference: 'P-2655-0A37'
            },
            dog: {
              id: 1,
              dogReference: 'ED300001',
              status: 'Pre-exempt'
            },
            exemption: {
              policeForce: 'Cheshire Constabulary',
              cdoExpiry: '2024-03-01'
            }
          }
        ]
      }

      expect(validation).toEqual({ value: expectedResponseValues })
      expect(validation.error).not.toBeDefined()
    })

    test('should validate with results returned with unknown attributes', () => {
      const response = {
        unknown: true,
        cdos: [
          {
            person: {
              id: 10,
              firstName: 'Scott',
              lastName: 'Pilgrim',
              personReference: 'P-2655-0A37',
              birthDate: '2000-01-01'
            },
            dog: {
              id: 1,
              dogReference: 'ED300001',
              status: 'Pre-exempt',
              name: 'Rex'
            },
            exemption: {
              policeForce: 'Cheshire Constabulary',
              cdoExpiry: '2024-03-01',
              deathDate: '2024-04-19'
            }
          }
        ]
      }

      const validation = getCdosResponseSchema.validate(response, { abortEarly: false })
      const expectedResponseValues = {
        unknown: true,
        cdos: [
          {
            person: {
              id: 10,
              firstName: 'Scott',
              lastName: 'Pilgrim',
              personReference: 'P-2655-0A37',
              birthDate: '2000-01-01'
            },
            dog: {
              id: 1,
              dogReference: 'ED300001',
              status: 'Pre-exempt',
              name: 'Rex'
            },
            exemption: {
              policeForce: 'Cheshire Constabulary',
              cdoExpiry: '2024-03-01',
              deathDate: '2024-04-19'
            }
          }
        ]
      }

      expect(validation).toEqual({ value: expectedResponseValues })
      expect(validation.error).not.toBeDefined()
    })

    test('should validate with no results returned', () => {
      const response = {
        cdos: []
      }

      const validation = getCdosResponseSchema.validate(response, { abortEarly: false })

      expect(validation.error).not.toBeDefined()
    })

    test('should not validate if no filters are passed', () => {
      const response = {}

      const validation = getCdosResponseSchema.validate(response, { abortEarly: false })
      expect(validation.error.message).toEqual('"cdos" is required')
    })
  })
})
