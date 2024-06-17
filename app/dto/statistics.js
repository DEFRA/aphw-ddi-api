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

module.exports = {
  countsPerStatusDto
}
