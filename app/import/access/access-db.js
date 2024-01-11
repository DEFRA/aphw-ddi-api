const storage = require('../../storage')
const readExcelFile = require('read-excel-file/node')
const accessDbSchema = require('./schema/access-db-schema')
const sequelize = require('../../config/db')
const { dbCreate } = require('../../lib/db-functions')

const parseBlob = async (blobFilename) => {
  const files = await storage.getInboundFileList()
  const xlsFilename = files.filter((x) => x === blobFilename)[0]
  const fileBuffer = await storage.downloadBlob('inbound', xlsFilename)
  return await readExcelFile(fileBuffer, { schema: accessDbSchema })
}

const saveParsedToBacklog = async (parseResult) => {
  await sequelize.transaction(async (t) => {
    // Insert rows into backlog
    for (let i = 0; i < parseResult.rows.length; i++) {
      const row = parseResult.rows[i]
      const error = parseResult.errors.filter(x => x.row === i + 2)
      await dbCreate(sequelize.models.backlog, { json: row, errors: JSON.stringify(error), status: error.length ? 'IMPORT_ERROR' : 'IMPORTED' }, { transaction: t })
    }
  })
}

module.exports = {
  parseBlob,
  saveParsedToBacklog
}
