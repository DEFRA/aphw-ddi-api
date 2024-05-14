const { insuranceQuerySchema } = require('../../../../../app/schema/admin/insurance')
describe('insurance schema', () => {
  describe('insuranceQuerySchema', () => {
    test('should allow empty value', () => {
      const { value, error } = insuranceQuerySchema.validate({})
      expect(error).not.toBeDefined()
      expect(value).toEqual({
        sortKey: 'name',
        sortOrder: 'ASC'
      })
    })

    test('should allow updatedAt sortKey key value', () => {
      const { value, error } = insuranceQuerySchema.validate({
        sortKey: 'updatedAt'
      })
      expect(error).not.toBeDefined()
      expect(value).toEqual({
        sortKey: 'updatedAt',
        sortOrder: 'ASC'
      })
    })

    test('should allow name sortKey key value', () => {
      const { value, error } = insuranceQuerySchema.validate({
        sortKey: 'name'
      })
      expect(error).not.toBeDefined()
      expect(value).toEqual({
        sortKey: 'name',
        sortOrder: 'ASC'
      })
    })

    test('should allow DESC sortKey sortOrder value', () => {
      const { value, error } = insuranceQuerySchema.validate({
        sortOrder: 'DESC'
      })
      expect(error).not.toBeDefined()
      expect(value).toEqual({
        sortKey: 'name',
        sortOrder: 'DESC'
      })
    })

    test('should allow ASC sortKey sortOrder value', () => {
      const { value, error } = insuranceQuerySchema.validate({
        sortOrder: 'ASC'
      })
      expect(error).not.toBeDefined()
      expect(value).toEqual({
        sortKey: 'name',
        sortOrder: 'ASC'
      })
    })

    test('should allow sortKey sortOrder and key value', () => {
      const { value, error } = insuranceQuerySchema.validate({
        sortKey: 'updatedAt',
        sortOrder: 'DESC'
      })
      expect(error).not.toBeDefined()
      expect(value).toEqual({
        sortKey: 'updatedAt',
        sortOrder: 'DESC'
      })
    })

    test('should not validate with invalid sortKey key', () => {
      const { error } = insuranceQuerySchema.validate({
        sortKey: 'unknownKey'
      })
      expect(error).toBeDefined()
    })

    test('should not validate with invalid sortKey sortOrder', () => {
      const { error } = insuranceQuerySchema.validate({
        sortOrder: 'HORIZONTAL'
      })
      expect(error).toBeDefined()
    })
  })
})
