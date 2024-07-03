const { recordInsuranceDetailsSchema } = require('../../../../../app/schema/cdo/manage')

describe('Manage CDO application', () => {
  describe('recordInsuranceDetailsSchema', () => {
    test('should not validate given no filters are passed', () => {
      const request = {}
      const validation = recordInsuranceDetailsSchema.validate(request, { abortEarly: false })

      expect(validation.error.message).toEqual('"insuranceCompany" is required. "insuranceRenewal" is required')
    })

    test('should validate given insuranceCompany and insuranceRenewal are passed', () => {
      const request = {
        insuranceCompany: 'Dog\'s Trust',
        insuranceRenewal: '2024-07-02T10:44:07.431Z'
      }

      const expectedRequestParams = {
        insuranceCompany: 'Dog\'s Trust',
        insuranceRenewal: new Date('2024-07-02T10:44:07.431Z')
      }
      const validation = recordInsuranceDetailsSchema.validate(request, { abortEarly: false })

      expect(validation).toEqual({ value: expectedRequestParams })
      expect(validation.error).not.toBeDefined()
    })

    test('should not validate given empty insuranceCompany is passed', () => {
      const queryParams = {
        insuranceCompany: '',
        insuranceRenewal: '2024-07-02T10:44:07.431Z'
      }
      const validation = recordInsuranceDetailsSchema.validate(queryParams, { abortEarly: false })

      expect(validation.error.message).toEqual('"insuranceRenewal" must be [null]')
    })

    test('should not validate given empty insuranceRenewal is passed', () => {
      const queryParams = {
        insuranceCompany: 'Dog\'s Trust',
        insuranceRenewal: null
      }
      const validation = recordInsuranceDetailsSchema.validate(queryParams, { abortEarly: false })

      expect(validation.error.message).toEqual('"insuranceRenewal" must be a valid date')
    })

    test('should validate given empty insuranceCompany and renewal date is passed', () => {
      const queryParams = {
        insuranceCompany: '',
        insuranceRenewal: null
      }
      const validation = recordInsuranceDetailsSchema.validate(queryParams, { abortEarly: false })

      expect(validation.error).not.toBeDefined()
    })
  })
})
