const { createCourtSchema } = require('../../../../../app/schema/court/create')

describe('createCourt schem', () => {
  describe('queryParams', () => {
    test('should validate given no filters are passed', () => {
      const queryParams = {}
      const validation = createCourtSchema.validate(queryParams, { abortEarly: false })

      expect(validation.error.message).toEqual('"name" is required')
    })

    test('should validate given name is passed', () => {
      const queryParams = {
        name: 'Tatooine Court of Appeals'
      }
      const expectedQueryParams = {
        name: 'Tatooine Court of Appeals'
      }
      const validation = createCourtSchema.validate(queryParams, { abortEarly: false })

      expect(validation).toEqual({ value: expectedQueryParams })
      expect(validation.error).not.toBeDefined()
    })

    test('should not validate given null value is passed', () => {
      const queryParams = {
        name: null
      }
      const validation = createCourtSchema.validate(queryParams, { abortEarly: false })

      expect(validation.error.message).toEqual('"name" must be a string')
    })
  })

  // describe('response', () => {
  //   test('should return correct response schema', () => {
  //     const response = {
  //       persons: [
  //         {
  //           firstName: 'Sammy',
  //           lastName: 'Leannon',
  //           birthDate: '1998-05-10',
  //           address: {
  //             addressLine1: '0141 Kihn Village EDITED',
  //             addressLine2: null,
  //             town: 'City of London',
  //             postcode: 'S1 1AA',
  //             country: 'England'
  //           },
  //           personReference: 'P-DB0D-A045',
  //           contacts: {
  //             emails: ['sammy.leannon@example.com'],
  //             primaryTelephones: ['01234567890'],
  //             secondaryTelephones: ['07890123456']
  //           }
  //         }
  //       ]
  //     }
  //
  //     const expectedResponse = {
  //       persons: [
  //         {
  //           firstName: 'Sammy',
  //           lastName: 'Leannon',
  //           birthDate: '1998-05-10',
  //           address: {
  //             addressLine1: '0141 Kihn Village EDITED',
  //             addressLine2: null,
  //             town: 'City of London',
  //             postcode: 'S1 1AA',
  //             country: 'England'
  //           },
  //           personReference: 'P-DB0D-A045',
  //           contacts: {
  //             emails: ['sammy.leannon@example.com'],
  //             primaryTelephones: ['01234567890'],
  //             secondaryTelephones: ['07890123456']
  //           }
  //         }
  //       ]
  //     }
  //
  //     const validation = personsResponseSchema.validate(response, { abortEarly: false })
  //     expect(validation.error).toBeUndefined()
  //     expect(validation.value).toEqual(expectedResponse)
  //   })
  //   test('should allow empty contact details', () => {
  //     const response = {
  //       persons: [
  //         {
  //           firstName: 'Sammy',
  //           lastName: 'Leannon',
  //           birthDate: '1998-05-10',
  //           address: {
  //             addressLine1: '0141 Kihn Village EDITED',
  //             addressLine2: null,
  //             town: 'City of London',
  //             postcode: 'S1 1AA',
  //             country: 'England'
  //           },
  //           personReference: 'P-DB0D-A045',
  //           contacts: {
  //             emails: [],
  //             primaryTelephones: [],
  //             secondaryTelephones: []
  //           }
  //         }
  //       ]
  //     }
  //
  //     const expectedResponse = {
  //       persons: [
  //         {
  //           firstName: 'Sammy',
  //           lastName: 'Leannon',
  //           birthDate: '1998-05-10',
  //           address: {
  //             addressLine1: '0141 Kihn Village EDITED',
  //             addressLine2: null,
  //             town: 'City of London',
  //             postcode: 'S1 1AA',
  //             country: 'England'
  //           },
  //           personReference: 'P-DB0D-A045',
  //           contacts: {
  //             emails: [],
  //             primaryTelephones: [],
  //             secondaryTelephones: []
  //           }
  //         }
  //       ]
  //     }
  //
  //     const validation = personsResponseSchema.validate(response, { abortEarly: false })
  //     expect(validation.error).toBeUndefined()
  //     expect(validation.value).toEqual(expectedResponse)
  //   })
  // })
})
