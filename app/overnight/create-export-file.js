const { getAllCdos } = require('../repos/cdo')
const { convertToCsv } = require('../export/csv')
const { uploadExportedFile } = require('../../app/storage/repos/export')

const createExportFile = async (rowsPerBatch) => {
  let result = ''

  try {
    const cdos = await getAllCdosInBatches(rowsPerBatch)
    const exportedData = convertToCsv(cdos)

    const Readable = require('stream').Readable
    const str = new Readable()
    str.push(exportedData)
    str.push(null)

    await uploadExportedFile(str, 'daily_export.csv')

    return `Success Export (${cdos.length} rows)`
  } catch (e) {
    console.log('Error create export file', e)
    result = `Error create export file: ${e}`
  }
  return result
}

const getAllCdosInBatches = async rowsPerBatch => {
  if (!rowsPerBatch || rowsPerBatch === '0') {
    return await getAllCdos()
  }

  let cdosSoFar = []
  let latestDogId = 1
  let numReturnedRows = 0

  do {
    const cdoBatch = await getAllCdos(latestDogId, rowsPerBatch)
    numReturnedRows = cdoBatch.length
    if (numReturnedRows > 0) {
      latestDogId = cdoBatch[numReturnedRows - 1].id + 1
      cdosSoFar = cdosSoFar.concat(cdoBatch)
    }
  } while (numReturnedRows > 0)

  return cdosSoFar
}

module.exports = {
  createExportFile
}
