const storage = require('../storage')
const readExcelFile = require('read-excel-file/node')
const accessDbSchema = require('./access-db-schema')
const sequelize = require('../config/db')
const { Op } = require('sequelize')

const parseBlob = async (blobFilename) => {
  const files = await storage.getInboundFileList()
  const xlsFilename = files.filter((x) => x === blobFilename)[0]
  const fileBuffer = await storage.downloadBlob('inbound', xlsFilename)
  return await readExcelFile(fileBuffer, { schema: accessDbSchema })
}

const saveParsedToBacklog = async (parseResult) => {
  sequelize.transaction(async (t) => {
    // Delete rows that have not yet moved to the proper base tables
    await sequelize.models.backlog.destroy({
      where: {
        status: {
          [Op.in]: ['IMPORTED', 'IMPORT_ERROR']
        }
      }
    })
    // Insert rows into backlog
    for (let i = 1; i < parseResult.rows.length; i++) {
      const row = parseResult.rows[i]
      const error = parseResult.errors.filter(x => x.row === i)
      await sequelize.models.backlog.create({ json: row, errors: error, status: error.length ? 'IMPORT_ERROR' : 'IMPORTED' }, { transaction: t })
    }
  })
}

module.exports = {
  parseBlob,
  saveParsedToBacklog
}
