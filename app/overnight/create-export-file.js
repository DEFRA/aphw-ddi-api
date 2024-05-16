const { getAllCdos } = require('../repos/cdo')
const { convertToCsv } = require('../export/csv')
const { uploadExportedFile } = require('../../app/storage/repos/export')

const createExportFile = async (rowsPerBatch) => {
  rowsPerBatch = rowsPerBatch ?? 0

  let tryNum = 1
  while (true) {
    console.log('try', tryNum)
    const res = await tryCreateExportFile(rowsPerBatch)

    if (tryNum >= 3 || res?.startsWith('Success')) {
      console.log('returing', res)
      return res
    }

    tryNum++
  }
}

const tryCreateExportFile = async (rowsPerBatch) => {
  try {
    const { exportedData, numRowsExported } = await generateCsv(rowsPerBatch)

    const Readable = require('stream').Readable
    const str = new Readable()
    str.push(exportedData)
    str.push(null)

    await uploadExportedFile(str, 'daily_export.csv')

    return `Success Export (${numRowsExported} rows, batches of ${rowsPerBatch})`
  } catch (e) {
    console.log('Error create export file', e)
    return `Error create export file: ${e}`
  }
}
const generateCsv = async rowsPerBatch => {
  if (!rowsPerBatch || rowsPerBatch === '0') {
    return generateCsvAltogether()
  }

  return generateCsvInBatches(rowsPerBatch)
}

const generateCsvAltogether = async () => {
  const allCdos = await getAllCdos()
  return {
    exportedData: convertToCsv(allCdos),
    numRowsExported: allCdos.length
  }
}

const generateCsvInBatches = async rowsPerBatch => {
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
  createExportFile,
  tryCreateExportFile
}
