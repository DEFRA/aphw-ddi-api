const { getAllCdos } = require('../repos/cdo')
const { convertToCsv } = require('../export/csv')
const { uploadExportedFile } = require('../../app/storage/repos/export')

const createExportFile = async (rowsPerBatch) => {
  let result = ''
  rowsPerBatch = rowsPerBatch ?? 0

  try {
    const { exportedData, numRowsExported } = await convertToCsvInBatches(rowsPerBatch)

    const Readable = require('stream').Readable
    const str = new Readable()
    str.push(exportedData)
    str.push(null)

    await uploadExportedFile(str, 'daily_export.csv')

    return `Success Export (${numRowsExported} rows, batches of ${rowsPerBatch})`
  } catch (e) {
    console.log('Error create export file', e)
    result = `Error create export file: ${e}`
  }
  return result
}

const convertToCsvInBatches = async rowsPerBatch => {
  if (!rowsPerBatch || rowsPerBatch === '0') {
    const allCdos = await getAllCdos()
    return {
      exportedData: convertToCsv(allCdos),
      numRowsExported: allCdos.length
    }
  }

  let csvSoFar = ''
  let latestDogId = 1
  let numReturnedRows = 0
  let totalRows = 0
  let isNotFirstLoopIteration = false

  do {
    const cdoBatch = await getAllCdos(latestDogId, rowsPerBatch)
    numReturnedRows = cdoBatch.length
    if (numReturnedRows > 0) {
      latestDogId = cdoBatch[numReturnedRows - 1].id + 1
      csvSoFar = csvSoFar + convertToCsv(cdoBatch, isNotFirstLoopIteration)
      totalRows += numReturnedRows
      isNotFirstLoopIteration = true
    }
  } while (numReturnedRows > 0)

  return {
    exportedData: csvSoFar,
    numRowsExported: totalRows
  }
}

module.exports = {
  createExportFile
}
