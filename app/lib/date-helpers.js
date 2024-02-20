const { format } = require('date-fns')

const formatDate = (date) => {
  return format(date, 'dd/MM/yyyy')
}

const formatDateAsUTCNoTime = (date) => {
  return format(date, 'yyyy-MM-dd')
}

module.exports = {
  formatDate,
  formatDateAsUTCNoTime
}
