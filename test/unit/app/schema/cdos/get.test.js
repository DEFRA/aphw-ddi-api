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
        withinDays: 30,
        noCache: false
      }

      expect(validation).toEqual({ value: expectedQueryParams })
      expect(validation.error).not.toBeDefined()
    })

    test('should validate if only a status is passed', () => {
      const queryParams = {
        status: 'PreExempt'
      }

      const validation = getCdosQuerySchema.validate(queryParams, { abortEarly: false })
      const expectedQueryParams = {
        status: ['PreExempt'],
        noCache: false
      }

      expect(validation).toEqual({ value: expectedQueryParams })
      expect(validation.error).not.toBeDefined()
    })

    test('should validate if nonComplianceLetterSent is passed', () => {
      const queryParams = {
        status: 'Failed',
        nonComplianceLetterSent: 'true'
      }

      const validation = getCdosQuerySchema.validate(queryParams, { abortEarly: false })
      const expectedQueryParams = {
        status: ['Failed'],
        nonComplianceLetterSent: true,
        noCache: false
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
        withinDays: 30,
        noCache: false
      }

      expect(validation).toEqual({ value: expectedQueryParams })
      expect(validation.error).not.toBeDefined()
    })

    test('should validate if only withinDays is passed', () => {
      const queryParams = {
        withinDays: '30'
      }

      const validation = getCdosQuerySchema.validate(queryParams, { abortEarly: false })
      const expectedQueryParams = {
        withinDays: 30,
        noCache: false
      }

      expect(validation).toEqual({ value: expectedQueryParams })
      expect(validation.error).not.toBeDefined()
    })

    test('should validate if sorting info is passed', () => {
      const queryParams = {
        status: 'InterimExempt',
        sortKey: 'joinedExemptionScheme',
        sortOrder: 'DESC'
      }

      const validation = getCdosQuerySchema.validate(queryParams, { abortEarly: false })
      const expectedQueryParams = {
        status: ['InterimExempt'],
        sortKey: 'joinedExemptionScheme',
        sortOrder: 'DESC',
        noCache: false
      }

      expect(validation).toEqual({ value: expectedQueryParams })
      expect(validation.error).not.toBeDefined()
    })

    test('should validate given sort key is policeForce', () => {
      const queryParams = {
        status: 'PreExempt',
        sortKey: 'policeForce',
        sortOrder: 'DESC'
      }

      const validation = getCdosQuerySchema.validate(queryParams, { abortEarly: false })
      const expectedQueryParams = {
        status: ['PreExempt'],
        sortKey: 'policeForce',
        sortOrder: 'DESC',
        noCache: false
      }

      expect(validation).toEqual({ value: expectedQueryParams })
      expect(validation.error).not.toBeDefined()
    })

    test('should validate given sort key is owner', () => {
      const queryParams = {
        status: 'PreExempt',
        sortKey: 'owner'
      }

      const validation = getCdosQuerySchema.validate(queryParams, { abortEarly: false })
      const expectedQueryParams = {
        status: ['PreExempt'],
        sortKey: 'owner',
        noCache: false
      }

      expect(validation).toEqual({ value: expectedQueryParams })
      expect(validation.error).not.toBeDefined()
    })

    test('should validate given sort key is indexNumber', () => {
      const queryParams = {
        status: 'PreExempt',
        sortKey: 'indexNumber'
      }

      const validation = getCdosQuerySchema.validate(queryParams, { abortEarly: false })
      const expectedQueryParams = {
        status: ['PreExempt'],
        sortKey: 'indexNumber',
        noCache: false
      }

      expect(validation).toEqual({ value: expectedQueryParams })
      expect(validation.error).not.toBeDefined()
    })

    test('should validate given no cache set', () => {
      const queryParams = {
        status: 'PreExempt',
        noCache: true
      }

      const validation = getCdosQuerySchema.validate(queryParams, { abortEarly: false })
      const expectedQueryParams = {
        status: ['PreExempt'],
        noCache: true
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

    test('should validate if incorrect sort order is passed', () => {
      const queryParams = {
        status: 'InterimExempt',
        sortKey: 'joinedExemptionScheme',
        sortOrder: 'ASCENDING'
      }

      const validation = getCdosQuerySchema.validate(queryParams, { abortEarly: false })
      expect(validation.error.message).toEqual('"sortOrder" must be one of [ASC, DESC]')
    })

    test('should validate if incorrect sort key is passed', () => {
      const queryParams = {
        status: 'InterimExempt',
        sortKey: 'joinedExemptionSchemes',
        sortOrder: 'ASC'
      }

      const validation = getCdosQuerySchema.validate(queryParams, { abortEarly: false })
      expect(validation.error.message).toEqual('"sortKey" must be one of [cdoExpiry, joinedExemptionScheme, indexNumber, policeForce, owner]')
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
              cdoExpiry: '2024-03-01',
              joinedExemptionScheme: '2023-11-12',
              nonComplianceLetterSent: '2024-03-10'
            }
          }
        ],
        count: 1,
        counts: {
          preExempt: {
            total: 1,
            within30: 0
          },
          failed: {
            nonComplianceLetterNotSent: 0
          }
        }
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
              cdoExpiry: '2024-03-01',
              joinedExemptionScheme: '2023-11-12',
              nonComplianceLetterSent: '2024-03-10'
            }
          }
        ],
        count: 1,
        counts: {
          preExempt: {
            total: 1,
            within30: 0
          },
          failed: {
            nonComplianceLetterNotSent: 0
          }
        }
      }

      expect(validation).toEqual({ value: expectedResponseValues })
      expect(validation.error).not.toBeDefined()
    })

    test('should validate with results returns some null values', () => {
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
              cdoExpiry: null,
              joinedExemptionScheme: null,
              nonComplianceLetterSent: null
            }
          }
        ],
        count: 1,
        counts: {
          preExempt: {
            total: 1,
            within30: 0
          },
          failed: {
            nonComplianceLetterNotSent: 0
          }
        }
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
              cdoExpiry: null,
              joinedExemptionScheme: null,
              nonComplianceLetterSent: null
            }
          }
        ],
        count: 1,
        counts: {
          preExempt: {
            total: 1,
            within30: 0
          },
          failed: {
            nonComplianceLetterNotSent: 0
          }
        }
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
              deathDate: '2024-04-19',
              joinedExemptionScheme: '2023-11-12',
              nonComplianceLetterSent: null
            }
          }
        ],
        count: 1,
        counts: {
          preExempt: {
            total: 1,
            within30: 0
          },
          failed: {
            nonComplianceLetterNotSent: 0
          }
        }
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
              deathDate: '2024-04-19',
              joinedExemptionScheme: '2023-11-12',
              nonComplianceLetterSent: null
            }
          }
        ],
        count: 1,
        counts: {
          preExempt: {
            total: 1,
            within30: 0
          },
          failed: {
            nonComplianceLetterNotSent: 0
          }
        }
      }

      expect(validation).toEqual({ value: expectedResponseValues })
      expect(validation.error).not.toBeDefined()
    })

    test('should validate with no results returned', () => {
      const response = {
        cdos: [],
        count: 0,
        counts: {
          preExempt: {
            total: 0,
            within30: 0
          },
          failed: {
            nonComplianceLetterNotSent: 0
          }
        }
      }

      const validation = getCdosResponseSchema.validate(response, { abortEarly: false })

      expect(validation.error).not.toBeDefined()
    })

    test('should not validate if no filters are passed', () => {
      const response = {}

      const validation = getCdosResponseSchema.validate(response, { abortEarly: false })
      expect(validation.error.message).toEqual('"count" is required. "cdos" is required')
    })
  })
})
