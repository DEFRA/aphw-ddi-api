const { addYears, addMinutes, dateTodayOrInFuture } = require('../../../../app/lib/date-helpers')

describe('DateHelpers test', () => {
  describe('addYears', () => {
    test('should add 10 years', async () => {
      expect(addYears(new Date(2000, 1, 1), 10)).toEqual(new Date(2010, 1, 1))
    })
    test('should add 1 year', async () => {
      expect(addYears(new Date(2005, 5, 5), 1)).toEqual(new Date(2006, 5, 5))
    })
    test('should remove 7 years', async () => {
      expect(addYears(new Date(2025, 7, 14), -7)).toEqual(new Date(2018, 7, 14))
    })
  })

  describe('addMinutess', () => {
    test('should add 10 minutes', async () => {
      expect(addMinutes(new Date(2000, 1, 1, 12, 0, 5), 10)).toEqual(new Date(2000, 1, 1, 12, 10, 5))
    })
    test('should add 220 minutes', async () => {
      expect(addMinutes(new Date(2000, 1, 1, 12, 0, 5), 220)).toEqual(new Date(2000, 1, 1, 15, 40, 5))
    })
  })

  describe('dateTodayOrInFuture', () => {
    test('should return true if date is today', () => {
      expect(dateTodayOrInFuture(new Date())).toBe(true)
    })
    test('should return true if date is tomorrow', () => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      expect(dateTodayOrInFuture(date)).toBe(true)
    })
    test('should return false if date is yesterday', () => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      expect(dateTodayOrInFuture(date)).toBe(false)
    })
  })
})
