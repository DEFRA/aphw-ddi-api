/**
 * @param {*} data - sequelize result of statistics query
 * @returns object formatted as follows:
 * [
 *  {
 *    status: {
 *      id: 1,
 *      name: 'Interim exempt'
 *    },
 *    total: 123
 *  },
 *  {
 *    status: {
 *      id: 2,
 *      name: 'Exempt'
 *    },
 *    total: 456
 *  }
 * ]
 */
const countsPerStatusDto = (data) => {
  return data
    ? data.map(rowCount => ({
      total: rowCount.total ? parseInt(rowCount.total) : 0,
      status: {
        name: rowCount.status.status,
        id: rowCount.status_id
      }
    }))
    : []
}

module.exports = {
  countsPerStatusDto
}
