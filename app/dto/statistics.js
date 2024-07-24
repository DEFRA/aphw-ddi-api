/**
 * @param {*} data - sequelize result of statistics query
 * @returns object formatted as follows:
 * [
 *  {
 *    status_id: 1,
 *    status: 'Interim exempt',
 *    total: 123,
 *    dogs: { status_id: 1 }
 *  },
 *  {
 *    status_id: 2,
 *    status: 'Exempt'
 *    total: 456,
 *    dogs: { status_id: 2 }
 *  }
 * ]
 */
const countsPerStatusDto = (data) => {
  return data
    ? data.map(rowCount => ({
      total: rowCount.total ? parseInt(rowCount.total) : 0,
      status: {
        name: rowCount.status,
        id: rowCount.status_id
      }
    }))
    : []
}

const addZeroCounts = (counts, breeds, countries) => {
  if (!counts || !breeds || !countries) {
    return []
  }

  const fullCounts = []
  breeds.forEach(breed => {
    countries.forEach(country => {
      const existingRow = counts.find(row => row.breed === breed.breed && row.country === country)
      fullCounts.push(existingRow ?? { total: 0, breed: breed.breed, country })
    })
  })
  return fullCounts
}

const countsPerCountryDto = (data) => {
  const countries = ['England', 'Wales', 'Scotland']

  const stats = data
    ? data.counts.map(rowCount => ({
      total: rowCount.total ? parseInt(rowCount.total) : 0,
      breed: rowCount.breed,
      country: rowCount.country
    }))
    : []

  return addZeroCounts(stats, data?.breeds, countries)
}

module.exports = {
  countsPerStatusDto,
  countsPerCountryDto
}
