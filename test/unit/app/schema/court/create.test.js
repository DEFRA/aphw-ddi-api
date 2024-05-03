const { createAdminItem } = require('../../../../../app/schema/admin/create')

describe('createCourt schem', () => {
  describe('queryParams', () => {
    test('should validate given no filters are passed', () => {
      const queryParams = {}
      const validation = createAdminItem.validate(queryParams, { abortEarly: false })

      expect(validation.error.message).toEqual('"name" is required')
    })

    test('should validate given name is passed', () => {
      const queryParams = {
        name: 'Tatooine Court of Appeals'
      }
      const expectedQueryParams = {
        name: 'Tatooine Court of Appeals'
      }
      const validation = createAdminItem.validate(queryParams, { abortEarly: false })

      expect(validation).toEqual({ value: expectedQueryParams })
      expect(validation.error).not.toBeDefined()
    })

    test('should not validate given null value is passed', () => {
      const queryParams = {
        name: null
      }
      const validation = createAdminItem.validate(queryParams, { abortEarly: false })

      expect(validation.error.message).toEqual('"name" must be a string')
    })
  })
})
