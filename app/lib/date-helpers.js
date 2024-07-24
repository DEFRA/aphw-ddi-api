const { format } = require('date-fns')

const formatDate = (date) => {
  return format(date, 'dd/MM/yyyy')
}

const formatDateAsUTCNoTime = (date) => {
  return format(date, 'yyyy-MM-dd')
}

const addYears = (date, years) => {
  const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  newDate.setFullYear(newDate.getFullYear() + years)
  return newDate
}

const dateTodayOrInFuture = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const checkedDate = new Date(date)
  checkedDate.setHours(0, 0, 0, 0)
  return checkedDate.getTime() >= today.getTime()
}

module.exports = {
  formatDate,
  formatDateAsUTCNoTime,
  addYears,
  dateTodayOrInFuture
}
