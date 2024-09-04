const { fieldNotNullOrEmpty, getFieldValue } = require('../../../../app/lib/field-helpers')

describe('FieldHelpers test', () => {
  describe('fieldNotNullOrEmpty', () => {
    test('should return true if field has a value that is not blank', async () => {
      expect(fieldNotNullOrEmpty('123')).toBeTruthy()
    })
    test('should return false if undefined', async () => {
      expect(fieldNotNullOrEmpty(undefined)).toBeFalsy()
    })
    test('should return false if null', async () => {
      expect(fieldNotNullOrEmpty(null)).toBeFalsy()
    })
    test('should return false if blank', async () => {
      expect(fieldNotNullOrEmpty('')).toBeFalsy()
    })
  })

  describe('getFieldValue', () => {
    test('should return value if standard field', () => {
      expect(getFieldValue({ prop1: 'val1' }, 'prop1')).toBe('val1')
    })
    test('should return undefined value if standard field is missing', () => {
      expect(getFieldValue({ prop1: 'val1' }, 'propMissing')).toBe(undefined)
    })
    test('should return nested value if complex field', () => {
      expect(getFieldValue({ outer: { childProp: 'val2' } }, 'outer.childProp')).toBe('val2')
    })
  })
})
