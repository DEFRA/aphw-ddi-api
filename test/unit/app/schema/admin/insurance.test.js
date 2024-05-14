const { insuranceQuerySchema } = require('../../../../../app/schema/admin/insurance')
describe('insurance schema', () => {
  describe('insuranceQuerySchema', () => {
    test('should allow empty value', () => {
      const { value, error } = insuranceQuerySchema.validate({})
      expect(error).not.toBeDefined()
      expect(value).toEqual({})
    })

    test('should allow updatedAt sort key value', () => {
      const { value, error } = insuranceQuerySchema.validate({
        sort: 'updatedAt'
      })
      expect(error).not.toBeDefined()
      expect(value).toEqual({
        sort: 'updatedAt'
      })
    })

    test('should allow name sort key value', () => {
      const { value, error } = insuranceQuerySchema.validate({
        sort: 'name'
      })
      expect(error).not.toBeDefined()
      expect(value).toEqual({
        sort: 'name'
      })
    })

    test('should allow DESC sort order value', () => {
      const { value, error } = insuranceQuerySchema.validate({
        order: 'DESC'
      })
      expect(error).not.toBeDefined()
      expect(value).toEqual({
        order: 'DESC'
      })
    })

    test('should allow ASC sort order value', () => {
      const { value, error } = insuranceQuerySchema.validate({
        order: 'ASC'
      })
      expect(error).not.toBeDefined()
      expect(value).toEqual({
        order: 'ASC'
      })
    })

    test('should allow sort order and key value', () => {
      const { value, error } = insuranceQuerySchema.validate({
        sort: 'updatedAt',
        order: 'DESC'
      })
      expect(error).not.toBeDefined()
      expect(value).toEqual({
        sort: 'updatedAt',
        order: 'DESC'
      })
    })

    test('should not validate with invalid sort key', () => {
      const { error } = insuranceQuerySchema.validate({
        sort: 'unknownKey'
      })
      expect(error).toBeDefined()
    })

    test('should not validate with invalid sort order', () => {
      const { error } = insuranceQuerySchema.validate({
        order: 'HORIZONTAL'
      })
      expect(error).toBeDefined()
    })
  })
})
