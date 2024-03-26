const { isDataUnchanged } = require('../../../../app/messaging/send-audit')

describe('SendAudit test', () => {
  test('isDataUnchanged should handle null payload', () => {
    const res = isDataUnchanged(null)
    expect(res).toBe(false)
  })

  test('isDataUnchanged should handle added', () => {
    const res = isDataUnchanged('abcdef"added":[]defghi')
    expect(res).toBe(false)
  })

  test('isDataUnchanged should handle removed', () => {
    const res = isDataUnchanged('abcdef"removed":[]defghi')
    expect(res).toBe(false)
  })

  test('isDataUnchanged should handle edited', () => {
    const res = isDataUnchanged('abcdef"edited":[]defghi')
    expect(res).toBe(false)
  })

  test('isDataUnchanged should return true when no data changed', () => {
    const res = isDataUnchanged('abcdef"added":[],"removed":[],"edited":[]defghi')
    expect(res).toBe(true)
  })

  test('isDataUnchanged should return false when data added', () => {
    const res = isDataUnchanged('abcdef"added":[123],"removed":[],"edited":[]defghi')
    expect(res).toBe(false)
  })

  test('isDataUnchanged should return false when data removed', () => {
    const res = isDataUnchanged('abcdef"added":[],"removed":[456],"edited":[]defghi')
    expect(res).toBe(false)
  })

  test('isDataUnchanged should return false when data edited', () => {
    const res = isDataUnchanged('abcdef"added":[],"removed":[],"edited":[789]defghi')
    expect(res).toBe(false)
  })

  test('isDataUnchanged should return false when data added and removed', () => {
    const res = isDataUnchanged('abcdef"added":[123],"removed":[456],"edited":[]defghi')
    expect(res).toBe(false)
  })
})
