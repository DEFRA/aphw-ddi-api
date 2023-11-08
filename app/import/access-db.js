const storage = require('../storage')
const readExcelFile = require('read-excel-file/node')
const accessDbSchema = require('./access-db-schema')
const sequelize = require('../config/db')
const sequelizePkg = require('sequelize')

const parseBlob = async (blobFilename) => {
  const files = await storage.getInboundFileList()
  const xlsFilename = files.filter((x) => x === blobFilename)[0]
  const fileBuffer = await storage.downloadBlob('inbound', xlsFilename)
  return await readExcelFile(fileBuffer, { schema: accessDbSchema })
}

const saveParsedToBacklog = async (parseResult) => {
  sequelize.transaction(async (t) => {
    await populateStaticData()

    // Delete rows that have not yet moved to the proper base tables
    await sequelize.models.backlog.destroy({
      where: {
        status: { [sequelizePkg.Op.in]: ['IMPORTED', 'IMPORT_ERROR'] }
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

const populateStaticData = async () => {
  const breedCount = await sequelize.models.dog_breed.count()
  if (breedCount === 0) {
    await sequelize.models.dog_breed.create({ id: 1, breed: 'XL Bully', active: true })
  }

  const mTypeCount = await sequelize.models.microchip_type.count()
  if (mTypeCount === 0) {
    await sequelize.models.microchip_type.create({ id: 1, type: 'Identichip' })
  }

  const statusCount = await sequelize.models.status.count()
  if (statusCount === 0) {
    await sequelize.models.status.create({ id: 1, status: 'IMPORTED_ACCESS_DB', status_type: 'IMPORTED' })
  }
}

module.exports = {
  parseBlob,
  saveParsedToBacklog
}
