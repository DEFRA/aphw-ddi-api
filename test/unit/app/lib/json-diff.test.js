const { jsonDiff } = require('../../../../app/lib/json-diff')

describe('JsonDiff test', () => {
  test(' Should handle no diffs', () => {
    const res = jsonDiff({ val: 123 }, { val: 123 })
    expect(res).toEqual({})
  })

  test(' Should handle null and null', () => {
    const res = jsonDiff(null, null)
    expect(res).toEqual({})
  })

  test(' Should handle one object being null', () => {
    const res = jsonDiff({ val: 123 }, null)
    expect(res).toEqual({})
  })

  test(' Should handle null and blank string being the same', () => {
    const res = jsonDiff({ val: '' }, { val: null })
    expect(res).toEqual({})
  })

  test(' Should handle blank string and null being the same', () => {
    const res = jsonDiff({ val: null }, { val: '' })
    expect(res).toEqual({})
  })

  test(' Should handle date with zero time being the same as date without time', () => {
    const res = jsonDiff({ val: '2020-01-01' }, { val: '2020-01-01T00:00:00.000Z' })
    expect(res).toEqual({})
  })

  test(' Should calculate diffs', () => {
    const res = jsonDiff({ val: 123 }, { val: 456 })
    expect(res).toEqual({ val: [123, 456] })
  })
})
