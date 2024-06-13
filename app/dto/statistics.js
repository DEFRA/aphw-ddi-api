const countsPerStatusDto = (data) => {
  return data
    ? data.map(rowCount => ({
      total: rowCount.total ? parseInt(rowCount.total) : 0,
      status: {
        status: rowCount.status.status,
        id: rowCount.status_id
      }
    }))
    : []
}

module.exports = {
  countsPerStatusDto
}
