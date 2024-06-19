const { expectDate, compareDates } = require('./time-helper')
describe('time-helpers', () => {
  describe('compareDates', () => {
    test('toBeRoughlyEqual should be roughly equal', () => {
      const date = new Date('2024-06-17T11:08:47.444Z')
      expect(compareDates(date).toBeRoughlyEqual(new Date('2024-06-17T11:09:47.444Z'))).toBe(true)
    })
    test('toBeNow should be now', () => {
      expect(compareDates(new Date()).toBeNow()).toBe(true)
    })
  })

  describe('expectDate', () => {
    describe('true', () => {
      test('toBeRoughlyEqual - is roughly equal', () => {
        const date = new Date('2024-06-17T11:08:47.444Z')
        expectDate(date).toBeRoughlyEqual(new Date('2024-06-17T11:09:47.444Z'))
      })
      test('toBeRoughlyEqual - is not roughly equal', () => {
        const date = new Date('2024-06-16T11:08:47.444Z')
        expect(() => { expectDate(date).toBeRoughlyEqual(new Date('2024-06-17T11:09:47.444Z')) }).toThrow(new RangeError('2024-06-16T11:08:47.444Z is not roughly equal to 2024-06-17T11:09:47.444Z'))
      })
      test('isNow - is now', () => {
        const date = new Date()
        expectDate(date).toBeNow()
      })
      test('isNow - is not now', () => {
        const date = new Date('2024-06-16T11:08:47.444Z')
        expect(() => { expectDate(date).toBeNow() }).toThrow('2024-06-16T11:08:47.444Z is not roughly equal to')
      })
    })

    describe('not', () => {
      test('not.toBeRoughlyEqual - is not roughly equal', () => {
        const date = new Date('2024-06-16T11:08:47.444Z')
        expectDate(date).not.toBeRoughlyEqual(new Date('2024-06-17T11:09:47.444Z'))
      })
      test('not.toBeRoughlyEqual - is roughly equal throws', () => {
        const date = new Date('2024-06-17T11:08:47.444Z')

        expect(() => { expectDate(date).not.toBeRoughlyEqual(new Date('2024-06-17T11:09:47.444Z')) }).toThrow('2024-06-17T11:08:47.444Z is roughly equal to 2024-06-17T11:09:47.444Z')
      })

      test('not.isNow - is not now', () => {
        const date = new Date('2024-06-16T11:08:47.444Z')
        expectDate(date).not.toBeNow()
      })
      test('not.isNow - is now', () => {
        const date = new Date()
        expect(() => { expectDate(date).not.toBeNow() }).toThrow()
      })
    })
  })

  //
  // test('dateIsNotNow - is not now', () => {
  //   expectDate(new Date('2024-06-16T11:08:47.444Z')).not.toBeNow()
  // })
})
