const { getAllCdos } = require('../repos/cdo')
const { convertToCsv } = require('../export/csv')

module.exports = {
  method: 'GET',
  path: '/export',
  handler: async (request, h) => {
    const cdos = await getAllCdos()
    const csv = convertToCsv(cdos)

    return h.response({
      csv
    }).code(200)
  }
}
