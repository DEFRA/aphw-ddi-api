// Parses 'DD/MM/YYYY' or 'DD-MM-YYYY' or 'DD-MM-YYYY' date strings into dates
const parseDateAsDDMMYYYY = (dateStr) => {
  if (!dateStr || dateStr.length !== 10) {
    return null
  }

  const parsedDate = new Date(parseInt(dateStr.substr(6, 4)), parseInt(dateStr.substr(3, 2)) - 1, parseInt(dateStr.substr(0, 2)))
  const formatted = `${formatDayOrMonth(parsedDate.getDate())}/${formatDayOrMonth(parsedDate.getMonth() + 1)}/${parsedDate.getFullYear()}`
  return formatted === dateStr ? parsedDate : null
}

const formatDayOrMonth = (dm) => {
  return dm < 10 ? `0${dm}` : `${dm}`
}

module.exports = {
  parseDateAsDDMMYYYY
}
