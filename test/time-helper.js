const getTimestampLowerRange = (date, offset = 100000) => {
  const timeInMilliseconds = date.getTime()
  return timeInMilliseconds - offset
}

const getTimestampUpperRange = (date, offset = 100000) => {
  const timeInMilliseconds = date.getTime()
  return timeInMilliseconds + offset
}

const dateIsNow = (date1) => {
  const now = new Date()
  expect(date1.getTime()).toBeGreaterThan(getTimestampLowerRange(now))
  expect(date1.getTime()).toBeLessThanOrEqual(getTimestampUpperRange(now))
}

const dateIsNotNow = (date1) => {
  const now = new Date()

  expect(date1.getTime()).toBeGreaterThan(getTimestampLowerRange(now))
  expect(date1.getTime()).toBeLessThanOrEqual(getTimestampUpperRange(now))
}

const compareDates = (date1) => {
  return {
    toBeRoughlyEqual (date) {
      const isGreaterThan = date1.getTime() > getTimestampLowerRange(date)
      const isLessThan = date1.getTime() < getTimestampUpperRange(date)

      return isGreaterThan && isLessThan
    },
    toBeNow () {
      const now = new Date()
      const isGreaterThan = date1.getTime() > getTimestampLowerRange(now)
      const isLessThan = date1.getTime() < getTimestampUpperRange(now)

      return isGreaterThan && isLessThan
    }
  }
}

const expectDateBase = (date1, inverse = false) => {
  const comparison = compareDates(date1)
  const failsTest = result => inverse ? result === true : result === false
  const error = inverse ? '' : 'not '

  return {
    toBeRoughlyEqual (date) {
      const check = comparison.toBeRoughlyEqual(date)
      if (failsTest(check)) {
        throw new RangeError(`${date1.toISOString()} is ${error}roughly equal to ${date.toISOString()}`)
      }
    },
    toBeNow () {
      const check = comparison.toBeNow()
      if (failsTest(check)) {
        throw new RangeError(`${date1.toISOString()} is ${error}roughly equal to ${new Date().toISOString()}`)
      }
    }
  }
}

const expectDate = (date1, inverse = false) => {
  return {
    ...expectDateBase(date1),
    not: expectDateBase(date1, true)
  }
}

module.exports = {
  compareDates,
  expectDate,
  getTimestampLowerRange,
  getTimestampUpperRange,
  dateIsNow
}
