const accessDb = require('../import/access/access-db')

module.exports = {
  method: 'GET',
  path: '/import-access-db/{filename}',
  options: { tags: ['api'] },
  handler: async (request, h) => {
    const filename = request.params.filename
    let res = null

    try {
      res = await accessDb.parseBlob(filename)
      await accessDb.saveParsedToBacklog(res)
    } catch (e) {
      console.log(e)
    }
    return h.response({
      rowsProcessed: res.rows.length,
      rowsInError: res?.errors.length
    }).code(200)
  }
}
