const { limitStringLength } = require('../../../../app/lib/string-helpers')

describe('StringHelpers test', () => {
  test('limitStringLength should handle null', () => {
    const res = limitStringLength(null, 10)
    expect(res).toBe('')
  })

  test('limitStringLength should not short if not too long 1', () => {
    const res = limitStringLength('123456789', 10)
    expect(res).toBe('123456789')
  })

  test('limitStringLength should not short if not too long 2', () => {
    const res = limitStringLength('1234567890', 10)
    expect(res).toBe('1234567890')
  })

  test('limitStringLength should shorten if too long', () => {
    const res = limitStringLength('12345678902', 10)
    expect(res).toBe('1234567890')
  })
})
