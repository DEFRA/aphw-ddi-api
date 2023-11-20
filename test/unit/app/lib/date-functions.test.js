const { parseDateAsDDMMYYYY } = require('../../../../app/lib/date-functions')

describe('DateFunctions test', () => {
  test('parseDateAsDDMMYYYY returns null if null date string', () => {
    const res = parseDateAsDDMMYYYY(null)
    expect(res).toBe(null)
  })

  test('parseDateAsDDMMYYYY returns null if invalid date string length', () => {
    const res = parseDateAsDDMMYYYY('01/01/123')
    expect(res).toBe(null)
  })

  test('parseDateAsDDMMYYYY returns null if invalid date string 1', () => {
    const res = parseDateAsDDMMYYYY('ab/cd/efgh')
    expect(res).toBe(null)
  })

  test('parseDateAsDDMMYYYY returns null if invalid date string 2', () => {
    const res = parseDateAsDDMMYYYY('32/01/2000')
    expect(res).toBe(null)
  })

  test('parseDateAsDDMMYYYY returns valid date if valid date string 1', () => {
    const res = parseDateAsDDMMYYYY('31/01/2000')
    expect(res.toISOString()).toBe(new Date(2000, 0, 31).toISOString())
  })

  test('parseDateAsDDMMYYYY returns valid date if valid date string 2', () => {
    const res = parseDateAsDDMMYYYY('06/05/2010')
    expect(res.toISOString()).toBe(new Date(2010, 4, 6).toISOString())
  })

  test('parseDateAsDDMMYYYY returns valid date if valid date string 2', () => {
    const res = parseDateAsDDMMYYYY('06/08/2010')
    expect(res.toISOString()).toBe(new Date(2010, 7, 6).toISOString())
  })

  test('parseDateAsDDMMYYYY returns valid date if valid date string 2', () => {
    const res = parseDateAsDDMMYYYY('06/09/2010')
    expect(res.toISOString()).toBe(new Date(2010, 8, 6).toISOString())
  })

  test('parseDateAsDDMMYYYY returns valid date if valid date string 2', () => {
    const res = parseDateAsDDMMYYYY('26/10/2010')
    expect(res.toISOString()).toBe(new Date(2010, 9, 26).toISOString())
  })
})
