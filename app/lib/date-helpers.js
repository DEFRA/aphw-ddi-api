const { format } = require('date-fns')

const formatDate = (date) => {
  return format(date, 'dd/MM/yyyy')
}

const formatDateAsUTCNoTime = (date) => {
  return format(date, 'yyyy-MM-dd')
}

const stripTime = date => {
  const dateToStrip = new Date(date)
  dateToStrip.setUTCHours(0, 0, 0, 0)

  return dateToStrip
}

const addYears = (date, years) => {
  const newDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  newDate.setUTCFullYear(newDate.getUTCFullYear() + years)
  return newDate
}

const addMinutes = (date, minutes) => {
  const newDate = new Date(date)
  newDate.setTime(newDate.getTime() + (minutes * 60 * 1000))
  return newDate
}

const addMonths = (date, months) => {
  const base = new Date(date)
  const newDate = stripTime(base)
  newDate.setUTCMonth(newDate.getUTCMonth() + months)

  return newDate
}

const addDays = (date, days) => {
  const startDate = new Date(date)
  startDate.setUTCDate(startDate.getUTCDate() + days)

  return startDate
}

const dateMoreThanOrEqual = (date1, date2) => {
  return date1.getTime() >= date2.getTime()
}

const dateLessThanOrEqual = (date1, date2) => {
  return date1.getTime() <= date2.getTime()
}

const compareDates = (date, compareFn) => {
  const today = stripTime(new Date())
  const checkedDate = stripTime(new Date(date))

  return compareFn(checkedDate, today)
}

const dateTodayOrInFuture = (date) => compareDates(date, dateMoreThanOrEqual)
const dateTodayOrInPast = (date) => compareDates(date, dateLessThanOrEqual)

const dateIsADate = (date) => date instanceof Date

module.exports = {
  formatDate,
  formatDateAsUTCNoTime,
  addDays,
  addYears,
  addMinutes,
  addMonths,
  dateTodayOrInFuture,
  dateTodayOrInPast,
  stripTime,
  dateIsADate
}
