const { addYears } = require('../../../../app/lib/date-helpers')

describe('DateHelpers test', () => {
  test('addYears should add 10 years', async () => {
    expect(addYears(new Date(2000, 1, 1), 10)).toEqual(new Date(2010, 1, 1))
  })
  test('addYears should add 1 year', async () => {
    expect(addYears(new Date(2005, 5, 5), 1)).toEqual(new Date(2006, 5, 5))
  })
  test('addYears should remove 7 years', async () => {
    expect(addYears(new Date(2025, 7, 14), -7)).toEqual(new Date(2018, 7, 14))
  })
})
